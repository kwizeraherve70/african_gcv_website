import { Link } from 'react-router';
import { Check, ArrowRight, Package, Mail, Truck } from 'lucide-react';
import { SEO } from '../components/SEO';

export function OrderConfirmation() {
  const orderNumber = `GCV-${Date.now().toString().slice(-8)}`;

  return (
    <div className="py-12 min-h-[80vh] flex items-center justify-center bg-accent/40">
      <SEO title="Order Confirmed" url="/order-confirmation" noIndex />
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-card rounded-2xl p-8 md:p-12 border border-border text-center shadow-xl shadow-black/5">

          {/* Checkmark */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-1">
            Thank you for your purchase from Pi Global GCV Alliance.
          </p>
          <div className="inline-block bg-accent/60 rounded-xl px-4 py-2 mb-8">
            <p className="text-xs text-muted-foreground">Order number</p>
            <p className="font-mono font-bold text-base tracking-wide">{orderNumber}</p>
          </div>

          {/* Next steps */}
          <div className="bg-accent/40 rounded-2xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-sm mb-4">What happens next?</h2>
            <div className="space-y-4">
              {[
                {
                  Icon: Mail,
                  color: '#5b21b6',
                  text: "You'll receive an order confirmation email shortly",
                },
                {
                  Icon: Package,
                  color: '#7c3aed',
                  text: 'Digital products will be sent to your email within 24 hours',
                },
                {
                  Icon: Truck,
                  color: '#10b981',
                  text: 'Physical products will be shipped within 2–3 business days',
                },
              ].map(({ Icon, color, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3.5 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light transition-all duration-200 inline-flex items-center justify-center gap-2 font-semibold shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="px-6 py-3.5 border border-border rounded-xl hover:bg-accent text-sm font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Need help with your order?</p>
            <Link to="/contact" className="text-brand-purple text-sm font-medium hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
