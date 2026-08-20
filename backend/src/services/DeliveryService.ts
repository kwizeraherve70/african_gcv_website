import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import {
  CreateDeliveryDto,
  IResponse,
  TDelivery,
  UpdateDeliveryDto,
} from "../utils/interfaces/common";
import AppError from "../utils/error";
import { sendEmailSafe } from "../utils/email";

const DELIVERY_STATUS_MESSAGES: Record<string, string> = {
  PENDING: "is being prepared",
  DISPATCHED: "has been dispatched",
  IN_TRANSIT: "is on its way",
  DELIVERED: "has been delivered",
  RETURNED: "has been returned",
};

export class DeliveryService extends BaseService {
  public static async createDelivery(
    deliveryData: CreateDeliveryDto,
  ): Promise<IResponse<TDelivery>> {
    const delivery = await prisma.delivery.create({
      data: {
        ...deliveryData,
        estimatedDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      include: { order: true },
    });

    await sendEmailSafe({
      to: delivery.customerEmail,
      subject: `Order Confirmation - #${delivery.order.orderNumber}`,
      body: `
    Dear ${delivery.customerFirstName},

    Thank you for your order! We've received it and it's now being processed.

    Order Number: ${delivery.order.orderNumber}
    Total Amount: $${delivery.order.totalAmount.toFixed(2)}

    Shipping To:
    ${delivery.address}, ${delivery.city}, ${delivery.province}, ${delivery.country} ${delivery.postalCode}

    Estimated delivery: ${delivery.estimatedDate?.toDateString() ?? "TBD"}

    We'll email you again as soon as your order ships.

    Best regards,
    Pi Global GCV Alliance Support Team
  `,
    });

    return {
      statusCode: 201,
      message: "Delivery created successfully",
      data: delivery,
    };
  }

  public static async updateDelivery(
    id: string,
    deliveryData: Partial<UpdateDeliveryDto>,
  ): Promise<IResponse<TDelivery>> {
    const delivery = await prisma.delivery.update({
      where: { id },
      data: deliveryData,
      include: { order: true },
    });

    if (deliveryData.deliveryStatus) {
      const statusMessage =
        DELIVERY_STATUS_MESSAGES[deliveryData.deliveryStatus] ??
        `is now ${deliveryData.deliveryStatus}`;
      await sendEmailSafe({
        to: delivery.customerEmail,
        subject: `Delivery Update - Order #${delivery.order.orderNumber}`,
        body: `
    Dear ${delivery.customerFirstName},

    Your order ${statusMessage}.

    ${
      deliveryData.deliveryStatus === "DELIVERED"
        ? "We hope you enjoy your purchase!"
        : "We'll keep you posted as it progresses."
    }

    Best regards,
    Pi Global GCV Alliance Support Team
  `,
      });
    }

    if (deliveryData.deliveryStatus === "RETURNED") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: "CANCELLED" },
      });
    } else if (deliveryData.deliveryStatus === "DELIVERED") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: "DELIVERED" },
      });
    }

    return {
      statusCode: 200,
      message: "Delivery updated successfully",
      data: delivery,
    };
  }

  public static async deleteDelivery(id: string): Promise<IResponse<null>> {
    await prisma.$transaction(async (prisma) => {
      const delivery = await prisma.delivery.findUnique({ where: { id } });
      if (!delivery) throw new AppError("Delivery not found", 404);

      await prisma.delivery.delete({ where: { id } }); // Delete delivery first
      await prisma.order.delete({ where: { id: delivery.orderId } }); // Then delete the associated order
    });

    return {
      statusCode: 200,
      message: "Delivery and related order deleted successfully",
      data: null,
    };
  }

  public static async getDelivery(id: string): Promise<IResponse<TDelivery>> {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: true,
            payment: true,
          },
        },
      },
    });
    if (!delivery) throw new AppError("Delivery not found", 404);
    return {
      statusCode: 200,
      message: "Delivery fetched successfully",
      data: delivery,
    };
  }

  public static async getAllDeliveries(): Promise<IResponse<TDelivery[]>> {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          include: {
            orderItems: true,
            payment: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedDeliveries = deliveries.map((delivery) => ({
      ...delivery,
      deliveredAt: delivery.deliveredAt ?? null,
    }));
    return {
      statusCode: 200,
      message: "Deliveries fetched successfully",
      data: formattedDeliveries as TDelivery[],
    };
  }
}
