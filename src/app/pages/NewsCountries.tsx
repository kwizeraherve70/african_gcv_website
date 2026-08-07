import { Link } from 'react-router';
import { Globe2, Newspaper, ArrowRight } from 'lucide-react';
import { GCV_AFRICA_COUNTRIES, newsArticles } from '../data/mockData';
import { SEO } from '../components/SEO';

export function NewsCountries() {
  return (
    <div className="py-12">
      <SEO
        title="News & Media"
        description="Browse GCV news by country — updates, ambassador activity, and merchant adoption stories from across GCV Africa."
        url="/news"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-2">
            Pi Global GCV Alliance
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">News & Media</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Choose a GCV Africa country to see local news, or browse everything at once.
          </p>
        </div>

        {/* All News */}
        <Link
          to="/news/all"
          className="group flex items-center justify-between gap-4 bg-gradient-to-br from-brand-purple to-brand-purple-light text-white rounded-2xl p-6 mb-8 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">All News & Announcements</h2>
              <p className="text-sm text-white/80">Articles, official announcements, and press releases from across the Alliance</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Country grid */}
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          GCV Africa — Browse by Country
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {GCV_AFRICA_COUNTRIES.map(country => {
            const count = newsArticles.filter(a => a.country === country.name).length;
            return (
              <Link
                key={country.slug}
                to={`/news/country/${country.slug}`}
                className="group bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-3xl leading-none mb-3 block">{country.flag}</span>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-brand-purple transition-colors">
                  {country.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Newspaper className="w-3 h-3" />
                  {count} stor{count !== 1 ? 'ies' : 'y'}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
