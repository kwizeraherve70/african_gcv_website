import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ambassadors } from '../data/mockData';
import { SEO } from '../components/SEO';
import { Globe, Mail } from 'lucide-react';

type Region = 'All' | 'Africa' | 'Europe' | 'Asia' | 'USA';
const REGIONS: Region[] = ['All', 'Africa', 'Europe', 'Asia', 'USA'];
const REGION_I18N_KEYS: Record<Region, string> = {
  All: 'all',
  Africa: 'africa',
  Europe: 'europe',
  Asia: 'asia',
  USA: 'usa',
};

const REGION_GRADIENTS: Record<string, string> = {
  Africa: 'from-brand-gold to-brand-gold',
  Europe: 'from-brand-purple to-purple-400',
  Asia: 'from-red-500 to-red-400',
  USA: 'from-brand-purple-light to-purple-400',
};

export function Ambassadors() {
  const { t } = useTranslation('about');
  const [activeRegion, setActiveRegion] = useState<Region>('All');

  const filtered = activeRegion === 'All'
    ? ambassadors
    : ambassadors.filter(a => a.region === activeRegion);

  return (
    <div>
      <SEO
        title={t('ambassadors.seo.title')}
        description={t('ambassadors.seo.description')}
        url="/ambassadors"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-gold via-brand-gold to-brand-purple text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Globe className="w-4 h-4 text-white" />
            <span className="text-sm font-medium">{t('ambassadors.hero.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{t('ambassadors.hero.title')}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('ambassadors.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { region: 'Africa', color: '#fbbf24' },
            { region: 'Europe', color: '#5b21b6' },
            { region: 'Asia', color: '#E53E3E' },
            { region: 'USA', color: '#7c3aed' },
          ].map(({ region, color }) => (
            <div key={region} className="bg-card rounded-2xl border border-border p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color }}>
                {ambassadors.filter(a => a.region === region).length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">{t(`regions.${REGION_I18N_KEYS[region as Region]}`)}</div>
            </div>
          ))}
        </div>

        {/* Region tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeRegion === region
                  ? 'bg-brand-gold text-white shadow-md shadow-brand-gold/30'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {region !== 'All' && <Globe className="w-3.5 h-3.5" />}
              {t(`regions.${REGION_I18N_KEYS[region]}`)}
            </button>
          ))}
        </div>

        {/* Ambassador cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(ambassador => (
            <div
              key={ambassador.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group"
            >
              <div className={`h-16 bg-gradient-to-br ${REGION_GRADIENTS[ambassador.region] || 'from-brand-purple to-brand-purple-light'}`} />
              <div className="-mt-8 flex justify-center mb-4">
                <img
                  src={ambassador.photo}
                  alt={ambassador.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-card shadow-lg"
                />
              </div>
              <div className="px-4 pb-5">
                <h3 className="font-bold text-sm mb-1">{ambassador.name}</h3>
                <p className="text-xs text-brand-gold font-semibold mb-1 leading-snug">{ambassador.title}</p>
                <p className="text-xs text-muted-foreground mb-3">{ambassador.country}</p>
                {ambassador.contact && (
                  <a
                    href={`mailto:${ambassador.contact}`}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-purple hover:text-brand-purple-light transition-colors font-medium"
                  >
                    <Mail className="w-3 h-3" />
                    {t('ambassadors.contactLink')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>{t('ambassadors.emptyState')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
