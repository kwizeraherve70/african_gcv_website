import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, ShieldCheck, Globe2, Users, Zap, ChevronRight } from 'lucide-react';
import type { Product } from '../data/mockData';
import { getAllProducts } from '../api/products';
import { ApiError } from '../api/client';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';

const PRODUCT_CATEGORIES = ['All', 'Sedans', 'SUVs', 'Sports Cars', 'Luxury'];

const CATEGORY_KEYS: Record<string, string> = {
  All: 'all',
  Sedans: 'sedans',
  SUVs: 'suvs',
  'Sports Cars': 'sportsCars',
  Luxury: 'luxury',
};

const WHY_PAY_IN_PI_KEYS = ['communityTarget', 'globalSecure', 'supportEcosystem', 'easyToUse'] as const;

const WHY_PAY_IN_PI_ICONS: Record<(typeof WHY_PAY_IN_PI_KEYS)[number], JSX.Element> = {
  communityTarget: <ShieldCheck className="w-5 h-5" />,
  globalSecure: <Globe2 className="w-5 h-5" />,
  supportEcosystem: <Users className="w-5 h-5" />,
  easyToUse: <Zap className="w-5 h-5" />,
};

export function Shop() {
  const { t } = useTranslation('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllProducts({ limit: 100 })
      .then(data => {
        if (!cancelled) setProducts(data);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : t('shop.error.fallbackMessage'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-10">
      <SEO
        title={t('shop.seo.title')}
        description={t('shop.seo.description')}
        url="/shop"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand-purple">{t('shop.breadcrumb.home')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground font-medium">{t('shop.breadcrumb.current')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8 tracking-tight">{t('shop.heading')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('shop.sidebar.productType')}</h2>
            <div className="flex flex-col gap-1 mb-8">
              {PRODUCT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors duration-150 ${
                    selectedCategory === cat
                      ? 'text-brand-purple font-semibold bg-brand-purple/10'
                      : 'text-foreground/70 hover:bg-accent'
                  }`}
                >
                  {t(`shop.categories.${CATEGORY_KEYS[cat]}`)}
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
            </div>

            {/* Pay in Pi promo */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-light text-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">{t('shop.promo.eyebrow')}</p>
              <h3 className="font-bold text-lg mb-3 leading-tight">{t('shop.promo.title')}</h3>
              <p className="text-sm text-white/80 mb-1">{t('shop.promo.rate')}</p>
              <p className="text-xs text-white/60 mb-4">{t('shop.promo.disclaimer')}</p>
              <Link
                to="/about"
                className="block text-center py-2 bg-brand-gold text-brand-ink text-sm font-bold rounded-xl hover:bg-yellow-300 transition-colors"
              >
                {t('shop.promo.learnMore')}
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('shop.search.placeholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/25"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? t('shop.filters.allCategories') : t(`shop.categories.${CATEGORY_KEYS[cat]}`)}</option>
                ))}
              </select>
              <select className="px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/25">
                <option>{t('shop.sort.featured')}</option>
                <option>{t('shop.sort.priceLowHigh')}</option>
                <option>{t('shop.sort.priceHighLow')}</option>
              </select>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              {loading ? t('shop.results.loading') : t('shop.results.count', { count: filteredProducts.length })}
            </p>
            {loading ? (
              <div className="text-center py-20 bg-brand-surface rounded-2xl">
                <p className="text-muted-foreground font-medium">{t('shop.results.loading')}</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-brand-surface rounded-2xl">
                <p className="text-red-500 font-medium mb-1">{t('shop.error.title')}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-brand-surface rounded-2xl">
                <p className="text-muted-foreground font-medium mb-1">{t('shop.empty.title')}</p>
                <p className="text-sm text-muted-foreground">{t('shop.empty.subtitle')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link
                    key={product.id}
                    to={`/shop/product/${product.slug}`}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-accent relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.compareAtPrice && (
                        <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t('shop.badge.sale')}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground font-medium mb-1.5">
                        {product.category}
                      </p>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-brand-gold text-brand-gold'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">${product.price}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">${product.compareAtPrice}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-brand-purple/70 font-medium mt-0.5">
                          {toPi(product.price)} π
                        </p>
                      </div>
                      {product.inventory < 999 && (
                        <div className="mt-2 text-xs font-medium">
                          {product.inventory === 0 ? (
                            <span className="text-red-500">{t('shop.stock.outOfStock')}</span>
                          ) : product.inventory < 10 ? (
                            <span className="text-orange-500">{t('shop.stock.onlyLeft', { count: product.inventory })}</span>
                          ) : (
                            <span className="text-brand-green">{t('shop.stock.inStock')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination (static — matches current mock data volume) */}
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button className="w-9 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors" disabled>‹</button>
              <button className="w-9 h-9 rounded-lg bg-brand-purple text-white text-sm font-semibold">1</button>
              <button className="w-9 h-9 rounded-lg border border-border text-sm hover:bg-accent transition-colors" disabled>›</button>
            </div>

            {/* Why Pay in Pi */}
            <div className="mt-16 pt-10 border-t border-border">
              <h2 className="text-xl font-heading font-bold mb-6 text-center">{t('shop.whyPayInPi.heading')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {WHY_PAY_IN_PI_KEYS.map(key => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0">
                      {WHY_PAY_IN_PI_ICONS[key]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t(`shop.whyPayInPi.${key}.title`)}</h3>
                      <p className="text-xs text-muted-foreground">{t(`shop.whyPayInPi.${key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
