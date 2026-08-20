import { apiFetch, ApiPaged, ApiResponse } from './client';

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

// --- Admin order management ---
// Backend TOrder (utils/interfaces/common.ts) declares only the scalar
// fields, but OrderService.getAllOrders/getOrder always `include` these
// relations at runtime — this is the actual wire shape the admin UI needs
// (order items with product names, payment status, delivery/customer info),
// not the narrower declared type.

export type DeliveryStatus = 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface AdminOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number | null;
  product?: { name: string };
}

export interface AdminPayment {
  id: string;
  status: string;
  method: string;
  amount: number;
  accountNumber: string;
  paidAt?: string | null;
}

export interface AdminDelivery {
  id: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string | null;
  deliveryStatus: DeliveryStatus;
  estimatedDate?: string | null;
  deliveredAt?: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  subTotal: number;
  deliveryFee?: number | null;
  createdAt: string;
  orderItems: AdminOrderItem[];
  payment?: AdminPayment | null;
  delivery?: AdminDelivery | null;
}

export async function getAllOrders(
  token: string,
  params?: { searchq?: string; limit?: number; page?: number },
): Promise<{ orders: AdminOrder[]; totalItems: number }> {
  const query = new URLSearchParams();
  if (params?.searchq) query.set('searchq', params.searchq);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString();

  const res = await apiFetch<ApiPaged<AdminOrder[]>>(`/order${qs ? `?${qs}` : ''}`, { token });
  return { orders: res.data ?? [], totalItems: res.totalItems };
}

export async function getOrder(id: string, token: string): Promise<AdminOrder> {
  const res = await apiFetch<ApiResponse<AdminOrder>>(`/order/${id}`, { token });
  return res.data!;
}
