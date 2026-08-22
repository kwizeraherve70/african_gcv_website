/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import {
  CreateCheckoutSessionDto,
  IResponse,
  TPayment,
  UpdatePaymentDto,
} from "../utils/interfaces/common";
import { PaymentService } from "../services/PaymentService";

@Tags("Payment")
@Route("/api/payment")
export class PaymentController {
  @Get("/")
  public async getAllPayments(): Promise<IResponse<TPayment[]>> {
    return PaymentService.getAllPayments();
  }

  /**
   * Starts a Stripe-hosted checkout for an existing order and returns the
   * URL to redirect the customer to. The actual payment confirmation
   * happens asynchronously via the `/api/payment/webhook` route (registered
   * directly on the Express app in index.ts, not through tsoa, since it
   * needs the raw request body for Stripe signature verification).
   */
  @Post("/checkout-session")
  public async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
  ): Promise<IResponse<{ url: string }>> {
    return PaymentService.createCheckoutSession(body);
  }

  @Put("/{id}")
  public async updatePayment(
    @Path() id: string,
    @Body() paymentData: Partial<UpdatePaymentDto>,
  ): Promise<IResponse<TPayment>> {
    return PaymentService.updatePayment(id, paymentData);
  }

  @Delete("/{id}")
  public async deletePayment(@Path() id: string): Promise<IResponse<null>> {
    return PaymentService.deletePayment(id);
  }

  @Get("/{id}")
  public async getPayment(@Path() id: string): Promise<IResponse<TPayment>> {
    return PaymentService.getPayment(id);
  }
}
