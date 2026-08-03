import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Minus, Plus, Star, ShoppingCart, Check } from 'lucide-react';
import { products } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';

export function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  if (!product) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-brand-purple font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const savings = product.compareAtPrice
    ? (product.compareAtPrice - product.price).toFixed(2)
    : null;

  return (
    <div className="py-10">
      <SEO
        title={product.name}
        description={product.shortDescription}
        image={product.images[0]}
        url={`/shop/product/${product.slug}`}
        type="product"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Shop
        </Link>

        {/* Product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-accent mb-4 ring-1 ring-border">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-brand-purple'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {product.category}
              {product.merchantName && <> · By {product.merchantName}</>}
            </p>
            <h1 className="text-3xl font-bold mb-4 tracking-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-brand-gold text-brand-gold'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-4xl font-bold">${product.price}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.compareAtPrice}
                    </span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Save ${savings}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-brand-purple/80 font-medium mt-1.5 flex items-center gap-1">
                <span className="text-lg leading-none">π</span>
                {toPi(product.price)} π at the fixed GCV rate
              </p>
            </div>

            {/* Short description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Inventory */}
            {product.inventory < 999 && (
              <div className="mb-6 flex items-center gap-2">
                {product.inventory === 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-red-500 font-medium text-sm">Out of Stock</span>
                  </>
                ) : product.inventory < 10 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-orange-500 font-medium text-sm">
                      Only {product.inventory} left in stock
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-green-600 font-medium text-sm">In Stock</span>
                  </>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl border border-border hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  disabled={quantity >= product.inventory}
                  className="w-10 h-10 rounded-xl border border-border hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.inventory === 0 || addedToCart}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                addedToCart
                  ? 'bg-green-500 text-white shadow-green-500/20'
                  : 'bg-brand-purple text-white hover:bg-brand-purple-light shadow-brand-purple/20 hover:shadow-brand-purple/30 hover:-translate-y-0.5'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="border-b border-border mb-8">
            <div className="flex gap-6">
              {(
                [
                  { id: 'description', label: 'Description' },
                  { id: 'reviews', label: `Reviews (${product.reviewCount})` },
                  { id: 'shipping', label: 'Shipping Info' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-purple text-brand-purple'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'description' && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {activeTab === 'reviews' && (
            <div className="py-8 text-center bg-accent/40 rounded-2xl">
              <p className="text-muted-foreground">
                Customer reviews coming soon. Be the first to review this product!
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="prose max-w-none">
              <h3>Shipping Information</h3>
              <p>We offer worldwide shipping on all products. Delivery times vary by location:</p>
              <ul>
                <li>Africa: 5–10 business days</li>
                <li>Europe: 7–14 business days</li>
                <li>North America: 10–15 business days</li>
                <li>Other regions: 15–20 business days</li>
              </ul>
              <p>Digital products are delivered instantly via email after purchase.</p>
              <h3>Returns & Refunds</h3>
              <p>
                We accept returns within 30 days of purchase for physical products.
                Digital products are non-refundable once accessed.
              </p>
            </div>
          )}
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map(related => (
                <Link
                  key={related.id}
                  to={`/shop/product/${related.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-accent">
                    <img
                      src={related.images[0]}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1.5">
                      {related.category}
                    </p>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug">
                      {related.name}
                    </h3>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${related.price}</span>
                        {related.compareAtPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${related.compareAtPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-purple/70 font-medium mt-0.5">
                        ≈ {toPi(related.price)} π (GCV)
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
