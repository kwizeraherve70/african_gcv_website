import { useState } from 'react';
import { allianceMembers } from '../data/mockData';
import { SEO } from '../components/SEO';
import { Building2, Globe } from 'lucide-react';

type Region = 'All' | 'Africa' | 'Europe' | 'Asia' | 'USA';
const REGIONS: Region[] = ['All', 'Africa', 'Europe', 'Asia', 'USA'];

const SECTOR_COLORS: Record<string, string> = {
  Agriculture: '#10b981',
  Education: '#5b21b6',
  Healthcare: '#E53E3E',
  Logistics: '#fbbf24',
  Technology: '#7c3aed',
  'Trade & Commerce': '#5b21b6',
  'Venture Capital': '#fbbf24',
  'Non-Profit': '#10b981',
};

export function IndustryAlliance() {
  const [activeRegion, setActiveRegion] = useState<Region>('All');

  const filtered = activeRegion === 'All'
    ? allianceMembers
    : allianceMembers.filter(m => m.region === activeRegion);

  return (
    <div>
      <SEO
        title="GCV Industry Alliance"
        description="Explore the GCV Industry Alliance — companies, organisations, and businesses across Africa, Europe, Asia, and the USA partnering with Pi Global GCV Alliance."
        url="/industry-alliance"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-purple-light via-brand-purple to-brand-purple text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Building2 className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-medium">Strategic Partners</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">GCV Industry Alliance</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Companies, institutions, and organisations across four continents aligned with the GCV standard and building the Pi-powered economy.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Region tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeRegion === region
                  ? 'bg-brand-purple-light text-white shadow-md shadow-brand-purple-light/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {region !== 'All' && <Globe className="w-3.5 h-3.5" />}
              {region}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeRegion === region ? 'bg-white/20' : 'bg-muted'
              }`}>
                {region === 'All' ? allianceMembers.length : allianceMembers.filter(m => m.region === region).length}
              </span>
            </button>
          ))}
        </div>

        {/* Alliance grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(member => (
            <div
              key={member.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={member.logo}
                  alt={member.company}
                  className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base leading-tight mb-1">{member.company}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: `${SECTOR_COLORS[member.sector] || '#5b21b6'}15`,
                        color: SECTOR_COLORS[member.sector] || '#5b21b6',
                      }}
                    >
                      {member.sector}
                    </span>
                    <span className="text-xs text-muted-foreground">{member.country}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{member.description}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {member.region}
                </span>
                <div className="w-2 h-2 bg-brand-green rounded-full" title="Active member" />
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No alliance members found for this region.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-brand-purple-light/10 to-brand-purple/10 rounded-2xl border border-brand-purple-light/20 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Join the Industry Alliance</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
            Is your company or organisation aligned with the GCV standard? Apply to become an official GCV Industry Alliance member.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple-light text-white rounded-xl font-semibold hover:bg-brand-purple-light transition-colors shadow-lg shadow-brand-purple-light/20"
          >
            Apply for Membership
          </a>
        </div>
      </div>
    </div>
  );
}
