import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { getAllOrders, AdminOrder, OrderStatus, DeliveryStatus } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  CONFIRMED: 'bg-blue-500/10 text-blue-600',
  DELIVERED: 'bg-green-500/10 text-green-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
};

const DELIVERY_STATUS_STYLE: Record<DeliveryStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  DISPATCHED: 'bg-blue-500/10 text-blue-600',
  IN_TRANSIT: 'bg-brand-purple/10 text-brand-purple',
  DELIVERED: 'bg-green-500/10 text-green-600',
  RETURNED: 'bg-red-500/10 text-red-600',
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

export function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAllOrders(token, { limit: 100 })
      .then(({ orders }) => setOrders(orders))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <SEO title="Manage Orders" url="/admin/orders" noIndex />
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold tracking-tight">Orders</h2>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Order Status</th>
                  <th className="px-5 py-3 font-semibold">Delivery</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-mono font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {order.delivery ? (
                        <>
                          <div className="font-medium">
                            {order.delivery.customerFirstName} {order.delivery.customerLastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{order.delivery.customerEmail}</div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <Badge label={order.status} className={ORDER_STATUS_STYLE[order.status]} />
                    </td>
                    <td className="px-5 py-3">
                      {order.delivery ? (
                        <Badge
                          label={order.delivery.deliveryStatus}
                          className={DELIVERY_STATUS_STYLE[order.delivery.deliveryStatus]}
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">No delivery</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {order.payment ? (
                        <span className="text-xs font-medium">{order.payment.status}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unpaid</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-purple hover:underline"
                        >
                          View
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
