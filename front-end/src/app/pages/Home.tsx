import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Globe, ShieldCheck, Coins, Building2,
  Users, Store, Package, CalendarDays, Clock,
  Mail, Phone, MessageCircle,
} from 'lucide-react';
import type { Product, NewsArticle } from '../data/mockData';
import { merchants } from '../data/mockData';
import { getAllProducts } from '../api/products';
import { getAllNews } from '../api/news';
import olivierImg from '@/assets/olivie.jpeg';
import { SEO } from '../components/SEO';
import { toPi, GCV_USD } from '../lib/pi';

const FEATURES = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Global Alliance',
    desc: 'Operating across 4 continents',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Secure & Trusted',
    desc: 'Transparent, reliable and accountable',
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: 'Pay in Pi',
    desc: 'Easy payments at the community GCV target',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Empowering Businesses',
    desc: 'Supporting merchants and entrepreneurs',
  },
];

const STATS = [
  { icon: <Users className="w-6 h-6" />, value: '12,500+', label: 'Members Worldwide' },
  { icon: <Store className="w-6 h-6" />, value: '3,200+', label: 'Active Merchants' },
  { icon: <Package className="w-6 h-6" />, value: '8,450+', label: 'Products Listed' },
  { icon: <CalendarDays className="w-6 h-6" />, value: '120+', label: 'Events Organized' },
];

/** Abstract dotted-network globe graphic for the hero — stands in for a literal continent map. */
function NetworkGraphic() {
  const nodes = [
    { x: 60, y: 90 }, { x: 140, y: 50 }, { x: 220, y: 100 },
    { x: 90, y: 170 }, { x: 190, y: 190 }, { x: 260, y: 60 },
    { x: 40, y: 220 }, { x: 240, y: 220 }, { x: 150, y: 250 },
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5],
    [3, 6], [4, 7], [4, 8], [0, 3], [2, 5],
  ];

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
      <circle cx="150" cy="150" r="140" fill="url(#globeFill)" opacity="0.5" />
      <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#FBBF24"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i === 4 ? 6 : 4} fill="#FBBF24">
          {i === 4 && (
            <animate attributeName="r" values="5;8;5" dur="2.4s" repeatCount="indefinite" />
          )}
        </circle>
      ))}
      <defs>
        <radialGradient id="globeFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5B21B6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllProducts({ limit: 100 }).then(data => {
      if (!cancelled) setProducts(data);
    });
    getAllNews({ limit: 3 }).then(data => {
      if (!cancelled) setNewsArticles(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredNews = newsArticles.slice(0, 3);
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  return (
    <div>
      <SEO
        title="Home"
        description="Pi Global GCV Alliance — a global trade alliance connecting Africa, Europe, Asia, and the USA through commerce, innovation, and shared prosperity. Pay in Pi at the community-proposed GCV target."
        url="/"
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white overflow-hidden py-6 lg:py-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-3 leading-[1.1] tracking-tight">
                Uniting the World,<br />
                <span className="text-brand-gold">Empowering Trade</span>
              </h1>

              <p className="text-sm mb-4 text-white/80 max-w-md leading-relaxed">
                A global alliance connecting Africa, Europe, Asia, and the USA through
                trade, innovation, and shared prosperity.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-4">
                <Link
                  to="/shop"
                  className="px-5 py-2.5 bg-brand-gold text-brand-ink rounded-xl hover:bg-yellow-300 transition-all duration-200 inline-flex items-center gap-2 font-bold shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Explore Market
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="px-5 py-2.5 bg-white/10 border border-white/25 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium text-sm"
                >
                  Join the Alliance
                </Link>
              </div>

              <div className="inline-flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 px-3.5 py-2.5 backdrop-blur-sm">
                <div>
                  <p className="text-xs text-white/60 font-medium uppercase tracking-wide mb-0.5">GCV Community Target</p>
                  <p className="text-base font-bold">1 π ≈ ${GCV_USD.toLocaleString('en-US')}</p>
                  <p className="text-xs text-white/50 mt-0.5">Not an official Pi Network or exchange rate.</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="w-[180px] h-[180px]">
                <NetworkGraphic />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ────────────────────────────────────────── */}
      <section className="py-10 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0">
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
      </section>

      {/* ── FEATURED IN GCV MARKET ───────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-2">
                GCV Market
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Featured in GCV Market</h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple group"
            >
              View All Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map(product => (
              <Link
                key={product.id}
                to={`/shop/product/${product.slug}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-accent">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">{product.category}</p>
                  <h3 className="font-semibold text-sm mb-3 line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">${product.price}</span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${product.compareAtPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-brand-purple/70 mt-0.5 font-medium">
                    {toPi(product.price)} π
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/shop"
              className="md:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────── */}
      <section className="py-14 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-brand-purple flex items-center justify-center flex-shrink-0 shadow-sm">
                  {icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-ink">{value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ──────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-2">
                Stay Informed
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Latest News</h2>
            </div>
            <Link
              to="/news/all"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple group"
            >
              View all news
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNews.map(article => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden bg-accent">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block px-2.5 py-1 bg-brand-purple/10 text-brand-purple text-xs font-semibold rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                    <span>{article.publishedAt}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/news/all"
              className="md:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple"
            >
              View all news
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOUNDER SPOTLIGHT ────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="inline-block px-3 py-1 bg-brand-gold/15 text-brand-ink text-xs font-semibold rounded-full mb-5">
                Founding Director, Pi Global GCV Alliance
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 tracking-tight">
                Olivier Ndatimana
              </h2>
              <blockquote className="border-l-4 border-brand-purple pl-5 mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Based in Kigali, Rwanda, Olivier leads the Alliance's mission to connect
                  merchants, entrepreneurs, and institutions across Africa, Europe, Asia, and
                  the USA under one shared trade and consensus-value standard.
                </p>
              </blockquote>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                As CEO of Kigali Hot Market Ltd, Olivier's mission is to give every market
                participant — from smallholder producers to service companies — fair, direct
                access to a growing global trade network.
              </p>
              <Link
                to="/team"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light transition-all duration-200 font-semibold shadow-lg hover:-translate-y-0.5"
              >
                Meet the Founders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-brand-purple/20 to-brand-gold/20 rounded-3xl blur-xl pointer-events-none" />
                <div className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-black/5">
                  <img src={olivierImg} alt="Olivier Ndatimana" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">Why We Exist</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Mission & Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-brand-purple rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To unite merchants, service providers, and institutions across Africa, Europe,
                Asia, and the USA under a single trade alliance — empowering every member with
                fair market access, priced fairly and payable in Pi at the community GCV target.
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-brand-gold rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Coins className="w-6 h-6 text-brand-ink" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                A global marketplace where trade flows freely across continents — powering
                agriculture, manufacturing, professional services, and commerce for every
                alliance member, priced consistently at the community GCV target of 1 π ≈ ${GCV_USD.toLocaleString('en-US')}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BECOME A MEMBER ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">Join the Alliance</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-5 tracking-tight">Become a Member</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The Pi Global GCV Alliance is open to every trader, business, and institution.
                Whether you want to be an Ambassador, register your business as a GCV Merchant,
                or simply join the community — there's a role for you.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { title: 'GCV Member', desc: 'Join the community and start browsing the GCV Market.' },
                  { title: 'GCV Merchant', desc: 'Register your business to accept Pi at the community GCV target.' },
                  { title: 'GCV Ambassador', desc: 'Lead the movement in your country or region.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{title}</span>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Join Today
                </Link>
                <Link
                  to="/about"
                  className="px-6 py-3 border border-border text-sm font-medium rounded-xl hover:bg-accent transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '4', label: 'Continents', color: 'text-brand-purple' },
                { value: `${merchants.length}+`, label: 'GCV Merchants', color: 'text-brand-green' },
                { value: `${products.length}+`, label: 'Products Listed', color: 'text-brand-purple-light' },
                { value: '$314,159', label: 'per π (GCV target)', color: 'text-brand-gold' },
              ].map(({ value, label, color }) => (
                <div
                  key={label}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow duration-200"
                >
                  <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT STRIP ────────────────────────────────────────── */}
      <section className="py-10 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a
              href="mailto:info@gcvalliance.org"
              className="flex items-center gap-4 group hover:text-brand-purple transition-colors"
            >
              <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-purple/20 transition-colors">
                <Mail className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Email Us</p>
                <p className="font-semibold text-sm">info@gcvalliance.org</p>
              </div>
            </a>
            <a
              href="tel:+250788547719"
              className="flex items-center gap-4 group hover:text-brand-green transition-colors"
            >
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition-colors">
                <Phone className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Call Us</p>
                <p className="font-semibold text-sm">+250 788 547 719</p>
              </div>
            </a>
            <a
              href="https://wa.me/250738013858"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group hover:text-[#25D366] transition-colors"
            >
              <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">WhatsApp</p>
                <p className="font-semibold text-sm">Chat With Us</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── JOIN THE ALLIANCE CTA ────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white overflow-hidden py-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <span className="inline-block px-3 py-1 bg-white/10 border border-white/15 text-white/80 text-xs font-semibold rounded-full mb-6 uppercase tracking-wider">
            Be Part of the Movement
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-5 tracking-tight">
            Join the Pi Global GCV Alliance Today!
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Be part of a global movement building prosperity through trade and unity.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-brand-gold text-brand-ink rounded-xl font-bold hover:bg-yellow-300 transition-all duration-200 inline-flex items-center gap-2 shadow-xl hover:-translate-y-0.5"
            >
              Become a Member
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 inline-flex items-center gap-2"
            >
              Explore Market
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
