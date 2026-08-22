import { apiFetch, ApiResponse } from './client';

/**
 * Starts a Stripe-hosted Checkout session for an already-created order.
 * The backend returns the URL of Stripe's payment page — the caller is
 * responsible for redirecting the browser there (`window.location.href`),
 * since this is a full-page hand-off, not a client-side route.
 */
export async function createCheckoutSession(orderId: string): Promise<{ url: string }> {
  const res = await apiFetch<ApiResponse<{ url: string }>>('/payment/checkout-session', {
    method: 'POST',
    body: { orderId },
  });
  return res.data!;
}
