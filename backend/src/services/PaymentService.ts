/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import {
  CreateCheckoutSessionDto,
  IResponse,
  TPayment,
  UpdatePaymentDto,
} from "../utils/interfaces/common";
import AppError from "../utils/error";
import { PaymentMethod } from "@prisma/client";
import { appEnv } from "../config/env";
import { sendEmailSafe } from "../utils/email";

const PAYMENT_STATUS_MESSAGES: Record<string, string> = {
  SUCCEEDED: "was successful",
  FAILED: "failed",
  PENDING: "is being processed",
};

// Constructed lazily (not at module load) so importing this service never
// crashes the server on boot just because STRIPE_SECRET_KEY isn't set yet —
// the previous Paypack SDK did exactly that, which took the whole app down
// regardless of whether any payment feature was touched.
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!appEnv.stripeSecretKey) {
    throw new AppError("Stripe is not configured (STRIPE_SECRET_KEY missing)", 500);
  }
  if (!stripeClient) {
    stripeClient = new Stripe(appEnv.stripeSecretKey);
  }
  return stripeClient;
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
function randomLetters(length: number): string {
  return Array.from({ length }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join("");
}

export class PaymentService extends BaseService {
  /**
   * Payment records don't carry the customer's email directly — it lives on
   * the linked Delivery — so this looks it up via the order. Silently no-ops
   * for orders that don't have a delivery yet (shouldn't happen in the
   * normal checkout flow, but payments can be created/synced independently).
   */
  private static async notifyPaymentStatus(
    orderId: string,
    status: string,
    amount: number,
  ): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });
    if (!order?.delivery) return;

    const statusMessage = PAYMENT_STATUS_MESSAGES[status] ?? `is now ${status}`;
    await sendEmailSafe({
      to: order.delivery.customerEmail,
      subject: `Payment Update - Order #${order.orderNumber}`,
      body: `
    Dear ${order.delivery.customerFirstName},

    Your payment of $${amount.toFixed(2)} for order #${order.orderNumber} ${statusMessage}.

    ${
      status === "FAILED"
        ? "Please try again or contact our support team for help."
        : status === "SUCCEEDED"
          ? "Thank you for your payment!"
          : "We'll notify you again once it's confirmed."
    }

    Best regards,
    Pi Global GCV Alliance Support Team
  `,
    });
  }

  /**
   * Creates a Stripe-hosted Checkout Session for an existing order and
   * upserts a PENDING Payment row pointing at it (refId = session id). The
   * webhook handler (`handleStripeWebhookEvent`) is what actually marks the
   * payment SUCCEEDED/FAILED once Stripe confirms the outcome — this method
   * only starts the flow and returns the URL the frontend should redirect
   * the customer to.
   */
  public static async createCheckoutSession(
    data: CreateCheckoutSessionDto,
  ): Promise<IResponse<{ url: string }>> {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { delivery: true, payment: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    if (order.payment?.status === "SUCCEEDED") {
      throw new AppError("This order has already been paid", 400);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(order.totalAmount * 100),
            product_data: {
              name: `Order #${order.orderNumber}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: order.delivery?.customerEmail,
      metadata: { orderId: order.id },
      success_url: `${appEnv.frontendUrl}/order-confirmation?orderId=${order.id}&orderNumber=${encodeURIComponent(order.orderNumber)}`,
      cancel_url: `${appEnv.frontendUrl}/checkout?canceled=true`,
      // Dashboard-only tracking label, not a business identifier — lets this
      // checkout flow be filtered/compared against future ones there.
      integration_identifier: `gcv_order_checkout_${randomLetters(8)}`,
    });

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        method: PaymentMethod.CARD,
        status: "PENDING",
        refId: session.id,
      },
      update: {
        amount: order.totalAmount,
        status: "PENDING",
        refId: session.id,
      },
    });

    if (!session.url) {
      throw new AppError("Stripe did not return a checkout URL", 500);
    }

    return {
      statusCode: 201,
      message: "Checkout session created successfully",
      data: { url: session.url },
    };
  }

  /**
   * Verifies and processes a raw Stripe webhook payload. Must be called with
   * the untouched request body Buffer (see index.ts, which mounts this route
   * with express.raw() ahead of the global json() middleware) — signature
   * verification fails on anything that's been re-serialized.
   */
  public static async handleStripeWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): Promise<IResponse<{ received: true }>> {
    if (!appEnv.stripeWebhookSecret) {
      throw new AppError("Stripe webhook secret is not configured", 500);
    }
    const stripe = getStripe();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        appEnv.stripeWebhookSecret,
      );
    } catch (err: any) {
      throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        // Delayed-notification payment methods (bank debits, etc.) fire this
        // event while payment_status is still "unpaid" — the real outcome
        // arrives later via async_payment_succeeded/failed. Fulfilling here
        // unconditionally would grant orders that go on to fail and skip
        // ones that succeed asynchronously.
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "unpaid") {
          await this.resolveSessionOutcome(session, "SUCCEEDED");
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.resolveSessionOutcome(session, "SUCCEEDED");
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.resolveSessionOutcome(session, "FAILED");
        break;
      }
      default:
        break;
    }

    return {
      statusCode: 200,
      message: "Webhook processed",
      data: { received: true },
    };
  }

  private static async resolveSessionOutcome(
    session: Stripe.Checkout.Session,
    outcome: "SUCCEEDED" | "FAILED",
  ): Promise<void> {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment || payment.status === "SUCCEEDED") return; // already settled / idempotency guard

    await prisma.payment.update({
      where: { orderId },
      data: {
        status: outcome,
        paidAt: outcome === "SUCCEEDED" ? new Date() : null,
        refId: session.id,
        accountProvider: typeof session.payment_intent === "string" ? session.payment_intent : null,
      },
    });

    if (outcome === "SUCCEEDED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" },
      });
    }

    await this.notifyPaymentStatus(orderId, outcome, payment.amount);
  }

  public static async updatePayment(
    id: string,
    paymentData: Partial<UpdatePaymentDto>,
  ): Promise<IResponse<TPayment>> {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...paymentData,
        method: paymentData.method
          ? (paymentData.method as PaymentMethod)
          : undefined,
        paidAt: paymentData.paidAt ?? null,
        accountProvider: paymentData.accountProvider ?? null,
        refId: paymentData.refId ?? null,
        accountNumber: paymentData.accountNumber ?? null,
      },
    });
    return {
      statusCode: 200,
      message: "Payment updated successfully",
      data: payment,
    };
  }

  public static async deletePayment(id: string): Promise<IResponse<null>> {
    await prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.findUnique({ where: { id } });
      if (!payment) throw new AppError("Payment not found", 404);

      // Delete associated deliveries first
      await prisma.delivery.deleteMany({ where: { orderId: payment.orderId } });

      await prisma.payment.delete({ where: { id } }); // Delete payment
      await prisma.order.delete({ where: { id: payment.orderId } }); // Then delete the associated order
    });

    return {
      statusCode: 200,
      message: "Payment, related deliveries, and order deleted successfully",
      data: null,
    };
  }

  public static async getPayment(id: string): Promise<IResponse<TPayment>> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });
    if (!payment) throw new AppError("Payment not found", 404);
    return {
      statusCode: 200,
      message: "Payment fetched successfully",
      data: payment,
    };
  }

  public static async getAllPayments(): Promise<IResponse<TPayment[]>> {
    const payments = await prisma.payment.findMany();
    return {
      statusCode: 200,
      message: "Payments fetched successfully",
      data: payments,
    };
  }
}
