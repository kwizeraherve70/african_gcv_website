import { apiFetch, ApiResponse } from './client';

export interface CreateOrderInput {
  deliveryFee?: number;
  discount?: number;
  orderItems: { productId: string; quantity: number }[];
}

export interface OrderResult {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subTotal: number;
}

/**
 * Guest checkout — OrderController.createOrder has no @Security guard by
 * design (see architecture-context.md "Guest checkout"), so this never
 * sends a token even if the shopper happens to be logged in.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  const res = await apiFetch<ApiResponse<OrderResult>>('/order', {
    method: 'POST',
    body: input,
  });
  return res.data!;
}

export interface CreateDeliveryInput {
  orderId: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string;
}

export async function createDelivery(input: CreateDeliveryInput): Promise<void> {
  await apiFetch('/delivery', { method: 'POST', body: input });
}
