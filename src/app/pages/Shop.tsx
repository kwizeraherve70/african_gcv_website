import { Link } from 'react-router';
import { useState } from 'react';
import { Search, Star, Briefcase, Building2, Store, ShieldCheck, Globe2, Users, Zap, ChevronRight } from 'lucide-react';
import { products, merchants, allianceMembers } from '../data/mockData';
import { SEO } from '../components/SEO';
import { toPi } from '../lib/pi';

type MarketType = 'products' | 'services' | 'companies' | 'merchants';

const PRODUCT_CATEGORIES = ['All', 'Books', 'Digital Resources', 'Merchandise', 'Courses'];

const SERVICES = [
  {
    id: '1',
    name: 'GCV Merchant Onboarding',
    description: 'Professional assistance registering and setting up your business as an official GCV merchant.',
    price: 'Free',
    category: 'Registration',
    icon: Store,
    color: 'var(--brand-green)',
  },
  {
    id: '2',
    name: 'Membership KYC Consultation',
    description: 'One-on-one guidance through the verification process for members and merchants.',
    price: '$9.99',
    category: 'Consulting',
    icon: Briefcase,
    color: 'var(--brand-purple)',
  },
  {
    id: '3',
    name: 'Community Workshop Facilitation',
    description: 'GCV trainers will come to your community and run a full-day trade education workshop for up to 50 participants.',
    price: 'Contact Us',
    category: 'Training',
    icon: Building2,
    color: 'var(--brand-purple-light)',
  },
  {
    id: '4',
    name: 'GCV Ambassador Training Programme',
    description: 'Structured certification programme for members who want to become official GCV Ambassadors.',
    price: 'Free',
    category: 'Training',
    icon: Star,
    color: 'var(--brand-gold)',
  },
];

const MARKET_TYPES: { id: MarketType; label: string; icon: typeof Store }[] = [
  { id: 'products', label: 'Products', icon: Store },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'merchants', label: 'Merchants', icon: Users },
];

const WHY_PAY_IN_PI = [
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Fixed GCV Rate', desc: 'Always 1 USD = 314159 π' },
  { icon: <Globe2 className="w-5 h-5" />, title: 'Global & Secure', desc: 'Safe and transparent transactions' },
  { icon: <Users className="w-5 h-5" />, title: 'Support Ecosystem', desc: 'Empowering merchants and communities' },
  { icon: <Zap className="w-5 h-5" />, title: 'Easy to Use', desc: 'Simple checkout experience' },
];

export function Shop() {
  const [activeType, setActiveType] = useState<MarketType>('products');
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

  const counts: Record<MarketType, number> = {
    products: products.length,
    services: SERVICES.length,
    companies: allianceMembers.length,
    merchants: merchants.length,
  };

  return (
    <div className="py-10">
      <SEO
        title="GCV Market"
        description="GCV Market — browse products, services, companies, and merchants. Pay with Pi at the fixed Global Consensus Value rate."
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
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Categories</h2>
            <nav className="flex flex-col gap-1 mb-8">
              {MARKET_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveType(id); setSearchQuery(''); setSelectedCategory('All'); }}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    activeType === id
                      ? 'bg-brand-purple text-white shadow-sm'
                      : 'text-foreground/80 hover:bg-accent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  <span className={`text-xs ${activeType === id ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {counts[id]}
                  </span>
                </button>
              ))}
            </nav>

            {activeType === 'products' && (
              <>
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
              </>
            )}

            {/* Pay in Pi promo */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-light text-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Pay in Pi</p>
              <h3 className="font-bold text-lg mb-3 leading-tight">Safe. Simple. Global.</h3>
              <p className="text-sm text-white/80 mb-4">1 USD = 314159 π</p>
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
                  placeholder="Search products, services or merchants…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                disabled={activeType !== 'products'}
                className="px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/25 disabled:opacity-50"
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

            {/* PRODUCTS */}
            {activeType === 'products' && (
              <>
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
                            {product.merchantName && <> · By {product.merchantName}</>}
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
              </>
            )}

            {/* SERVICES */}
            {activeType === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {SERVICES.map(service => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.id}
                      className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `color-mix(in srgb, ${service.color} 15%, transparent)` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: service.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="font-bold text-base leading-tight">{service.name}</h3>
                            <span
                              className="text-sm font-bold flex-shrink-0"
                              style={{ color: service.color }}
                            >
                              {service.price}
                            </span>
                          </div>
                          <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-muted-foreground mb-3 inline-block">
                            {service.category}
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                          <Link
                            to="/contact"
                            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-purple hover:underline"
                          >
                            Enquire Now →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* COMPANIES */}
            {activeType === 'companies' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  GCV-aligned companies and institutions across the alliance.{' '}
                  <Link to="/industry-alliance" className="text-brand-purple font-medium hover:underline">
                    View full Industry Alliance →
                  </Link>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {allianceMembers.map(member => (
                    <div
                      key={member.id}
                      className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={member.logo}
                          alt={member.company}
                          className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-sm">{member.company}</h3>
                          <p className="text-xs text-muted-foreground">{member.country}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full font-medium">
                        {member.sector}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {member.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MERCHANTS */}
            {activeType === 'merchants' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  Businesses accepting Pi at the fixed GCV rate.{' '}
                  <Link to="/merchants" className="text-brand-purple font-medium hover:underline">
                    View full Merchant Directory →
                  </Link>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {merchants.map(merchant => (
                    <div
                      key={merchant.id}
                      className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <img
                        src={merchant.logo}
                        alt={merchant.name}
                        className="w-12 h-12 rounded-xl object-cover border border-border mb-3"
                      />
                      <h3 className="font-bold text-sm mb-0.5">{merchant.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{merchant.country}</p>
                      <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-medium">
                        {merchant.category}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {merchant.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
