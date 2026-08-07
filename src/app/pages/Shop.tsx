import { Link } from 'react-router';
import { useState } from 'react';
import { Search, Star, ShieldCheck, Globe2, Users, Zap, ChevronRight } from 'lucide-react';
import { products } from '../data/mockData';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';

const PRODUCT_CATEGORIES = ['All', 'Sedans', 'SUVs', 'Sports Cars', 'Luxury'];

const WHY_PAY_IN_PI = [
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Community GCV Target', desc: 'Priced at 1 π ≈ $314,159 (unofficial)' },
  { icon: <Globe2 className="w-5 h-5" />, title: 'Global & Secure', desc: 'Safe and transparent transactions' },
  { icon: <Users className="w-5 h-5" />, title: 'Support Ecosystem', desc: 'Empowering merchants and communities' },
  { icon: <Zap className="w-5 h-5" />, title: 'Easy to Use', desc: 'Simple checkout experience' },
];

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
        title="GCV Market"
        description="GCV Market — browse products. Pay with Pi at the fixed Global Consensus Value rate."
        url="/shop"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand-purple">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground font-medium">GCV Market</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8 tracking-tight">GCV Market</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Product Type</h2>
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
                  {cat}
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
            </div>

            {/* Pay in Pi promo */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-light text-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Pay in Pi</p>
              <h3 className="font-bold text-lg mb-3 leading-tight">Safe. Simple. Global.</h3>
              <p className="text-sm text-white/80 mb-1">GCV target: 1 π ≈ $314,159</p>
              <p className="text-xs text-white/60 mb-4">Community-proposed, not an official rate.</p>
              <Link
                to="/about"
                className="block text-center py-2 bg-brand-gold text-brand-ink text-sm font-bold rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Learn More
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
                  placeholder="Search products…"
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
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <select className="px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/25">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-brand-surface rounded-2xl">
                <p className="text-muted-foreground font-medium mb-1">No products found</p>
                <p className="text-sm text-muted-foreground">Try a different search term or category</p>
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
                          SALE
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
                            <span className="text-red-500">Out of Stock</span>
                          ) : product.inventory < 10 ? (
                            <span className="text-orange-500">Only {product.inventory} left</span>
                          ) : (
                            <span className="text-brand-green">In Stock</span>
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
              <h2 className="text-xl font-heading font-bold mb-6 text-center">Why Pay in Pi?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {WHY_PAY_IN_PI.map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{title}</h3>
                      <p className="text-xs text-muted-foreground">{desc}</p>
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
