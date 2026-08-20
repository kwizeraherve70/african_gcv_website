import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { getOrder, AdminOrder, DeliveryStatus } from '../../api/orders';
import { updateDeliveryStatus, DELIVERY_STATUSES } from '../../api/delivery';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | ''>('');
  const [updating, setUpdating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    getOrder(id, token)
      .then(o => {
        setOrder(o);
        setSelectedStatus(o.delivery?.deliveryStatus ?? '');
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load order.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleUpdateStatus = async () => {
    if (!token || !order?.delivery || !selectedStatus) return;
    setUpdating(true);
    setError(null);
    setNotice(null);
    try {
      const updatedDelivery = await updateDeliveryStatus(order.delivery.id, selectedStatus, token);
      setOrder({ ...order, delivery: updatedDelivery });
      setNotice(`Delivery status updated to ${updatedDelivery.deliveryStatus}. The customer has been emailed.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update delivery status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="p-8 text-center text-muted-foreground text-sm">Loading order…</p>;
  }

  if (error && !order) {
    return <div className="px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>;
  }

  if (!order) return null;

  return (
    <div>
      <SEO title={`Order ${order.orderNumber}`} url={`/admin/orders/${order.id}`} noIndex />
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight font-mono">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-accent">{order.status}</span>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}
      {notice && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 text-green-600 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order items */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
            Order Items
          </h3>
          <div className="space-y-3">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product?.name ?? item.productId}{' '}
                  <span className="font-medium text-foreground">× {item.quantity}</span>
                </span>
                <span className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${order.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-semibold">${(order.deliveryFee ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Payment */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
              Payment
            </h3>
            {order.payment ? (
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Status:</span> <span className="font-medium">{order.payment.status}</span></p>
                <p><span className="text-muted-foreground">Method:</span> <span className="font-medium">{order.payment.method}</span></p>
                <p><span className="text-muted-foreground">Amount:</span> <span className="font-medium">${order.payment.amount.toFixed(2)}</span></p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment recorded for this order yet.</p>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
              Delivery
            </h3>
            {order.delivery ? (
              <>
                <div className="text-sm space-y-1 mb-5">
                  <p className="font-medium">
                    {order.delivery.customerFirstName} {order.delivery.customerLastName}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {order.delivery.customerEmail}
                  </p>
                  <p className="text-muted-foreground">{order.delivery.customerPhone}</p>
                  <p className="text-muted-foreground">
                    {order.delivery.address}, {order.delivery.city}, {order.delivery.province},{' '}
                    {order.delivery.country} {order.delivery.postalCode}
                  </p>
                </div>

                <label className="block text-sm font-medium mb-1.5">Delivery Status</label>
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value as DeliveryStatus)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all"
                  >
                    {DELIVERY_STATUSES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || selectedStatus === order.delivery.deliveryStatus}
                    className="px-4 py-2.5 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {updating ? 'Updating…' : 'Update'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Changing this status emails the customer automatically.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No delivery recorded for this order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
