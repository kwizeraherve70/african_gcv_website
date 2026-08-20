import { apiFetch, ApiResponse } from './client';
import { AdminDelivery, DeliveryStatus } from './orders';

export const DELIVERY_STATUSES: { value: DeliveryStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
];

/**
 * Triggers DeliveryService.updateDelivery on the backend, which emails the
 * customer about the status change as a side effect — see
 * backend/src/services/DeliveryService.ts.
 */
export async function updateDeliveryStatus(
  id: string,
  deliveryStatus: DeliveryStatus,
  token: string,
): Promise<AdminDelivery> {
  const res = await apiFetch<ApiResponse<AdminDelivery>>(`/delivery/${id}`, {
    method: 'PUT',
    body: { deliveryStatus },
    token,
  });
  return res.data!;
}
