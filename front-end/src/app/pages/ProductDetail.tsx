import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Minus, Plus, Star, ShoppingCart, Check } from 'lucide-react';
import type { Product } from '../data/mockData';
import { getProductBySlug, getAllProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';
import { sanitizeHtml } from '../lib/sanitize';

export function ProductDetail() {
  const { t } = useTranslation('shop');
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setProduct(undefined);
    setSelectedImage(0);
    setQuantity(1);
    getProductBySlug(slug).then(found => {
      if (cancelled) return;
      setProduct(found);
      if (found) {
        getAllProducts({ limit: 100 }).then(all => {
          if (cancelled) return;
          setRelatedProducts(
            all.filter(p => p.id !== found.id && p.category === found.category).slice(0, 4)
          );
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (product === undefined) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">{t('productDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">{t('productDetail.notFound.title')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('productDetail.notFound.text')}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-brand-purple font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('productDetail.notFound.backToShop')}
          </Link>
        </div>
      </div>
    );
  }

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
          {t('productDetail.backToShop')}
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
              {product.merchantName && <>{t('productDetail.byMerchant', { name: product.merchantName })}</>}
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
                {t('productDetail.ratingSummary', { rating: product.rating, count: product.reviewCount })}
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
                      {t('productDetail.save', { amount: savings })}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-brand-purple/80 font-medium mt-1.5 flex items-center gap-1">
                <span className="text-lg leading-none">π</span>
                {t('productDetail.gcvNote', { piAmount: toPi(product.price) })}
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
                    <span className="text-red-500 font-medium text-sm">{t('productDetail.stock.outOfStock')}</span>
                  </>
                ) : product.inventory < 10 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-orange-500 font-medium text-sm">
                      {t('productDetail.stock.onlyLeftInStock', { count: product.inventory })}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-green-600 font-medium text-sm">{t('productDetail.stock.inStock')}</span>
                  </>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">{t('productDetail.quantity.label')}</label>
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
                  {t('productDetail.addToCart.added')}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  {t('productDetail.addToCart.add')}
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
                  { id: 'description', label: t('productDetail.tabs.description') },
                  { id: 'reviews', label: t('productDetail.tabs.reviews', { count: product.reviewCount }) },
                  { id: 'shipping', label: t('productDetail.tabs.shipping') },
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
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          )}

          {activeTab === 'reviews' && (
            <div className="py-8 text-center bg-accent/40 rounded-2xl">
              <p className="text-muted-foreground">
                {t('productDetail.reviews.comingSoon')}
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="prose max-w-none">
              <h3>{t('productDetail.shipping.deliveryHeading')}</h3>
              <p>{t('productDetail.shipping.deliveryIntro')}</p>
              <ul>
                <li>{t('productDetail.shipping.africa')}</li>
                <li>{t('productDetail.shipping.europe')}</li>
                <li>{t('productDetail.shipping.northAmerica')}</li>
                <li>{t('productDetail.shipping.other')}</li>
              </ul>
              <p>{t('productDetail.shipping.docs')}</p>
              <h3>{t('productDetail.shipping.returnsHeading')}</h3>
              <p>
                {t('productDetail.shipping.returnsText')}
              </p>
            </div>
          )}
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('productDetail.relatedProducts.heading')}</h2>
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
                        {t('productDetail.relatedProducts.gcvNote', { piAmount: toPi(related.price) })}
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
