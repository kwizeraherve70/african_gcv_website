import { useState } from 'react';
import { merchants } from '../data/mockData';
import { SEO } from '../components/SEO';
import { Store, Search, ExternalLink, Mail } from 'lucide-react';

const CATEGORIES = ['All', 'Food & Beverage', 'Technology', 'Fashion & Clothing', 'Education', 'Transport', 'Agriculture', 'Professional Services', 'Healthcare'];

export function Merchants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = merchants.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <SEO
        title="Merchant Directory"
        description="Browse the GCV Merchant Directory — African businesses accepting Pi at the Global Consensus Value standard in food, tech, education, healthcare, and more."
        url="/merchants"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-green text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Store className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-medium">Pi Merchants</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Merchant Directory</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover African businesses accepting Pi at the GCV standard. From food vendors to tech companies — shop, eat, and transact in Pi.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search merchants by name, category, or country…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/15 border border-white/25 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} merchant{filtered.length !== 1 ? 's' : ''} found
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </p>

        {/* Merchant grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(merchant => (
              <div
                key={merchant.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={merchant.logo}
                      alt={merchant.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight line-clamp-1">{merchant.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{merchant.country}</p>
                    </div>
                  </div>
                  <span className="inline-block text-xs bg-brand-purple/10 text-brand-purple px-2.5 py-1 rounded-lg font-medium mb-3">
                    {merchant.category}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {merchant.description}
                  </p>
                </div>
                <div className="px-5 pb-4 pt-2 border-t border-border flex items-center gap-3">
                  {merchant.contact && (
                    <a
                      href={`mailto:${merchant.contact}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-purple transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </a>
                  )}
                  {merchant.website && (
                    <a
                      href={merchant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-purple transition-colors ml-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No merchants found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-brand-purple text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Become a merchant CTA */}
        <div className="mt-16 bg-gradient-to-br from-brand-green/10 to-brand-purple/10 rounded-2xl border border-brand-green/20 p-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">List Your Business</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Accept Pi at GCV and join Africa's growing merchant network. Registration is free for all GCV-aligned businesses.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green transition-colors shadow-lg shadow-brand-green/20"
          >
            Register as a Merchant
          </a>
        </div>
      </div>
    </div>
  );
}
