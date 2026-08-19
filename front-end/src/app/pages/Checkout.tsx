import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Check, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, createDelivery } from '../api/orders';
import { ApiError } from '../api/client';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';

function PiIcon({ className }: { className?: string }) {
  return (
    <span className={`${className} inline-flex items-center justify-center font-bold leading-none`}>
      π
    </span>
  );
}

type Step = 'shipping' | 'payment' | 'review';

const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';

export function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
    paymentMethod: 'card',
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shipping = 10;
  const total = subtotal + shipping;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 'shipping') {
      setCurrentStep('payment');
      return;
    }
    if (currentStep === 'payment') {
      setCurrentStep('review');
      return;
    }

    // Payment is not wired to a real processor yet — the checkout's
    // "payment method" step is display-only (see progress-tracker.md
    // Open Questions: "Is there a real payment processor in scope").
    // What Day 3 wires for real is the Order + Delivery it creates.
    setOrderError(null);
    setPlacingOrder(true);
    try {
      const order = await createOrder({
        deliveryFee: shipping,
        orderItems: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      });

      const [firstName, ...rest] = formData.fullName.trim().split(/\s+/);
      await createDelivery({
        orderId: order.id,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        postalCode: formData.postalCode,
        customerFirstName: firstName || formData.fullName,
        customerLastName: rest.join(' ') || firstName || formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      clearCart();
      navigate('/order-confirmation', { state: { orderNumber: order.orderNumber } });
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : 'Could not place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Redirecting as a side effect belongs in an effect, not directly in the
  // render body — calling navigate() during render is impure. The delay
  // before acting on an empty cart matters too: React Router v7 wraps
  // navigate() in startTransition, so this component can render with a
  // transient/stale `items` snapshot in the instant the /cart -> /checkout
  // transition starts, one tick before CartContext has propagated — an
  // immediate redirect on that snapshot bounces straight back to /cart even
  // though the cart is genuinely non-empty a moment later. Debouncing gives
  // the transition a moment to settle before concluding the cart is truly
  // empty (confirmed empirically: this was reliably reproducible with no
  // delay and never reproduced once even a single extra microtask of delay
  // was introduced).
  useEffect(() => {
    if (items.length > 0 || placingOrder) return;
    const timeout = setTimeout(() => navigate('/cart'), 150);
    return () => clearTimeout(timeout);
  }, [items.length, placingOrder, navigate]);

  if (items.length === 0) {
    return null;
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="py-12 bg-accent/40 min-h-screen">
      <SEO title="Checkout" url="/checkout" noIndex />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      index < currentStepIndex
                        ? 'bg-brand-purple text-white'
                        : index === currentStepIndex
                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                        : 'bg-card border-2 border-border text-muted-foreground'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      index <= currentStepIndex
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 mb-5 transition-colors duration-300 ${
                      index < currentStepIndex ? 'bg-brand-purple' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl p-6 md:p-8 border border-border"
        >

          {/* Step 1: Shipping */}
          {currentStep === 'shipping' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+250 700 000 000"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Kigali"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Province / State *</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    placeholder="Kigali City"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder="Rwanda"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="00000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 'payment' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Payment Method</h2>
              <div className="space-y-3">
                {[
                  {
                    value: 'card',
                    Icon: CreditCard,
                    title: 'Credit / Debit Card',
                    desc: 'Pay securely with your credit or debit card',
                  },
                  {
                    value: 'mobile_money',
                    Icon: Smartphone,
                    title: 'Mobile Money',
                    desc: 'M-Pesa, MTN Mobile Money, Orange Money',
                  },
                  {
                    value: 'pi',
                    Icon: PiIcon,
                    title: 'Pay with Pi',
                    desc: `Pay directly from your Pi Wallet — ${toPi(total)} π at the community GCV target`,
                  },
                ].map(({ value, Icon, title, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-150 ${
                      formData.paymentMethod === value
                        ? 'border-brand-purple bg-brand-purple/5'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={formData.paymentMethod === value}
                      onChange={handleInputChange}
                      className="mt-1 accent-brand-purple"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-sm">{title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5 p-4 bg-accent/60 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  {formData.paymentMethod === 'pi'
                    ? `You'll confirm this payment in your Pi Wallet app. GCV is a community-proposed target, not an official Pi Network rate.`
                    : 'Your payment information is encrypted and secure. We never store your card details.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Review Order</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-accent/40 rounded-xl p-4">
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Shipping To
                  </h3>
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{formData.fullName}</p>
                    <p className="text-muted-foreground">{formData.email}</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                    <p className="text-muted-foreground">{formData.address}</p>
                    <p className="text-muted-foreground">
                      {formData.city}, {formData.province}, {formData.country} {formData.postalCode}
                    </p>
                  </div>
                </div>
                <div className="bg-accent/40 rounded-xl p-4">
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Payment
                  </h3>
                  <p className="text-sm font-medium">
                    {formData.paymentMethod === 'card'
                      ? 'Credit / Debit Card'
                      : formData.paymentMethod === 'pi'
                      ? 'Pay with Pi'
                      : 'Mobile Money'}
                  </p>
                  {formData.paymentMethod === 'pi' && (
                    <p className="text-xs text-brand-purple font-medium mt-1">
                      {toPi(total)} π (GCV target)
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-accent/40 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name}{' '}
                        <span className="font-medium text-foreground">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {formData.paymentMethod === 'pi' && (
                    <p className="text-xs text-brand-purple font-medium text-right">
                      {toPi(total)} π (GCV target)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order error */}
          {orderError && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{orderError}</div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep !== 'shipping' && (
              <button
                type="button"
                onClick={() => {
                  const idx = STEPS.findIndex(s => s.id === currentStep);
                  if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
                }}
                disabled={placingOrder}
                className="flex-1 py-3.5 px-6 border border-border rounded-xl hover:bg-accent text-sm font-medium transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={placingOrder}
              className="flex-1 py-3.5 px-6 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {currentStep === 'review' ? (placingOrder ? 'Placing Order…' : 'Place Order') : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
