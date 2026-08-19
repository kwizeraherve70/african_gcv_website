import { Link } from 'react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';

export function Cart() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="py-12 min-h-[60vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center py-16 bg-brand-surface rounded-2xl">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-brand-purple" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2 tracking-tight">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Browse the GCV Market to find products, services, and companies.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light transition-all duration-200 font-semibold shadow-lg hover:-translate-y-0.5"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <SEO title="Shopping Cart" url="/cart" noIndex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-heading font-bold mb-8 tracking-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {items.map((item, idx) => (
                <div
                  key={item.product.id}
                  className={`flex gap-4 p-5 ${
                    idx < items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/shop/product/${item.product.slug}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-accent hover:opacity-80 transition-opacity">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/shop/product/${item.product.slug}`}
                      className="font-semibold text-sm hover:text-brand-purple transition-colors line-clamp-2 leading-snug"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {item.product.price.toFixed(2)} USD
                    </p>
                    <p className="font-bold mt-2 text-base">${item.product.price}</p>
                    <p className="text-[10px] text-brand-purple/70 font-medium">
                      {toPi(item.product.price)} π
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-border hover:bg-accent flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.inventory}
                        className="w-8 h-8 rounded-lg border border-border hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-brand-purple/70 font-medium">
                        {toPi(item.product.price * item.quantity)} π
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 mt-5 text-sm text-muted-foreground hover:text-brand-purple transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Cart Summary */}
          <div>
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
              <h2 className="text-lg font-heading font-bold mb-5">Cart Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)
                  </span>
                  <span className="font-semibold">${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">${shipping.toFixed(2)} USD</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">${total.toFixed(2)} USD</span>
                  </div>
                  <p className="text-xs text-brand-purple font-medium text-right mt-1">
                    {toPi(total)} π
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center mb-4">
                GCV target: 1 π ≈ $314,159 (community-proposed, not an official rate)
              </p>

              <Link
                to="/checkout"
                className="flex w-full items-center justify-center gap-2 py-3.5 bg-brand-gold text-brand-ink text-sm font-bold rounded-xl hover:bg-yellow-300 transition-all duration-200 hover:-translate-y-0.5 mb-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
