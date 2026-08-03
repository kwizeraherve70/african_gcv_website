import { useState } from 'react';
import { founders } from '../data/mockData';
import { SEO } from '../components/SEO';
import { Star, Globe } from 'lucide-react';

type Region = 'All' | 'Africa' | 'Europe' | 'Asia' | 'USA';
const REGIONS: Region[] = ['All', 'Africa', 'Europe', 'Asia', 'USA'];

const REGION_COLORS: Record<string, string> = {
  Africa: 'from-brand-purple to-brand-purple-light',
  Europe: 'from-brand-purple-light to-purple-400',
  Asia: 'from-brand-gold to-yellow-300',
  USA: 'from-brand-green to-emerald-400',
};

export function Founders() {
  const [activeRegion, setActiveRegion] = useState<Region>('All');

  const filtered = activeRegion === 'All'
    ? founders
    : founders.filter(f => f.region === activeRegion);

  return (
    <div>
      <SEO
        title="GCV Founders"
        description="Meet the visionary founders of the Pi Global GCV Alliance from Africa, Europe, Asia, and the USA who built the movement from the ground up."
        url="/founders"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-medium">The Visionaries</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">GCV Founders</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            The members who had the vision and courage to establish the Global Consensus Value alliance and build its regional chapters from scratch.
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
                  ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {region !== 'All' && <Globe className="w-3.5 h-3.5" />}
              {region}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeRegion === region ? 'bg-white/20' : 'bg-muted'
              }`}>
                {region === 'All' ? founders.length : founders.filter(f => f.region === region).length}
              </span>
            </button>
          ))}
        </div>

        {/* Founders grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(founder => (
            <div
              key={founder.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Gradient header */}
              <div className={`h-20 bg-gradient-to-br ${REGION_COLORS[founder.region] || 'from-brand-purple to-brand-purple-light'} relative`}>
                <div className="absolute -bottom-8 left-5">
                  <img
                    src={founder.photo}
                    alt={founder.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-card shadow-lg"
                  />
                </div>
                <div className="absolute top-3 right-4">
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    {founder.region}
                  </span>
                </div>
              </div>

              <div className="pt-10 p-5">
                <h3 className="font-bold text-base mb-0.5">{founder.name}</h3>
                <p className="text-xs text-brand-purple font-semibold mb-1">{founder.role}</p>
                <p className="text-xs text-muted-foreground mb-3">{founder.country}</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{founder.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No founders found for this region.</p>
          </div>
        )}
      </div>
    </div>
  );
}
