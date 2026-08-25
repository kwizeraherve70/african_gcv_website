import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, createDelivery } from '../api/orders';
import { createCheckoutSession } from '../api/payment';
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

const STEPS: Step[] = ['shipping', 'payment', 'review'];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';

export function Checkout() {
  const { t } = useTranslation('checkout');
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
  const [orderError, setOrderError] = useState<string | null>(
    new URLSearchParams(window.location.search).get('canceled') === 'true'
      ? t('checkout.canceledNotice')
      : null
  );

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

    // "Pay with Pi" and "Mobile Money" remain display-only — Pi settlement
    // and a mobile-money processor are still open product questions (see
    // progress-tracker.md). "Credit / Debit Card" is wired to a real Stripe
    // Checkout session below.
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

      if (formData.paymentMethod === 'card') {
        // Cart is intentionally left intact here — Stripe's cancel_url
        // brings the shopper back to this page, and they need their cart
        // to still be there to retry. OrderConfirmation clears it once the
        // Stripe success_url redirect actually lands.
        const { url } = await createCheckoutSession(order.id);
        window.location.href = url;
        return;
      }

      clearCart();
      navigate('/order-confirmation', { state: { orderNumber: order.orderNumber } });
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : t('checkout.genericOrderError'));
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

  const currentStepIndex = STEPS.findIndex(s => s === currentStep);

  return (
    <div className="py-12 bg-accent/40 min-h-screen">
      <SEO title="Checkout" url="/checkout" noIndex />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex items-center">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
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
                    {t(`checkout.steps.${step}`)}
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
              <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('checkout.shippingForm.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.fullName')}</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.fullNamePlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.emailPlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.phone')}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.phonePlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.address')}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.addressPlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.city')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.cityPlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.province')}</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.provincePlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.country')}</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder={t('checkout.shippingForm.countryPlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.shippingForm.postalCode')}</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder={t('checkout.shippingForm.postalCodePlaceholder')}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 'payment' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('checkout.paymentMethods.title')}</h2>
              <div className="space-y-3">
                {[
                  {
                    value: 'card',
                    Icon: CreditCard,
                    title: t('checkout.paymentMethods.card.title'),
                    desc: t('checkout.paymentMethods.card.description'),
                  },
                  {
                    value: 'mobile_money',
                    Icon: Smartphone,
                    title: t('checkout.paymentMethods.mobileMoney.title'),
                    desc: t('checkout.paymentMethods.mobileMoney.description'),
                  },
                  {
                    value: 'pi',
                    Icon: PiIcon,
                    title: t('checkout.paymentMethods.pi.title'),
                    desc: t('checkout.paymentMethods.pi.description', { amount: toPi(total) }),
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
                    ? t('checkout.paymentMethods.piNotice')
                    : t('checkout.paymentMethods.secureNotice')}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('checkout.review.title')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-accent/40 rounded-xl p-4">
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    {t('checkout.review.shippingTo')}
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
                    {t('checkout.review.payment')}
                  </h3>
                  <p className="text-sm font-medium">
                    {formData.paymentMethod === 'card'
                      ? t('checkout.paymentMethods.card.title')
                      : formData.paymentMethod === 'pi'
                      ? t('checkout.paymentMethods.pi.title')
                      : t('checkout.paymentMethods.mobileMoney.title')}
                  </p>
                  {formData.paymentMethod === 'pi' && (
                    <p className="text-xs text-brand-purple font-medium mt-1">
                      {t('checkout.review.piTarget', { amount: toPi(total) })}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-accent/40 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
                  {t('checkout.review.orderItems')}
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
                    <span className="text-muted-foreground">{t('checkout.review.subtotal')}</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('checkout.review.shipping')}</span>
                    <span className="font-semibold">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>{t('checkout.review.total')}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {formData.paymentMethod === 'pi' && (
                    <p className="text-xs text-brand-purple font-medium text-right">
                      {t('checkout.review.piTarget', { amount: toPi(total) })}
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
                  const idx = STEPS.findIndex(s => s === currentStep);
                  if (idx > 0) setCurrentStep(STEPS[idx - 1]);
                }}
                disabled={placingOrder}
                className="flex-1 py-3.5 px-6 border border-border rounded-xl hover:bg-accent text-sm font-medium transition-colors disabled:opacity-50"
              >
                {t('checkout.buttons.back')}
              </button>
            )}
            <button
              type="submit"
              disabled={placingOrder}
              className="flex-1 py-3.5 px-6 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {currentStep === 'review'
                ? (placingOrder ? t('checkout.buttons.placingOrder') : t('checkout.buttons.placeOrder'))
                : t('checkout.buttons.continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
