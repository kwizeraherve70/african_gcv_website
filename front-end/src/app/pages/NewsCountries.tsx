import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Globe2, Newspaper, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NewsArticle } from '../types/news';
import { GCV_AFRICA_COUNTRIES } from '../data/mockData';
import { getAllNews } from '../api/news';
import { SEO } from '../components/SEO';

export function NewsCountries() {
  const { t } = useTranslation('news');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllNews({ limit: 100 }).then(data => {
      if (!cancelled) setNewsArticles(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-12">
      <SEO
        title={t('newsCountries.seo.title')}
        description={t('newsCountries.seo.description')}
        url="/news"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-2">
            {t('newsCountries.eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">{t('newsCountries.title')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t('newsCountries.subtitle')}
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
              <h2 className="font-bold text-lg leading-tight">{t('newsCountries.allNews.title')}</h2>
              <p className="text-sm text-white/80">{t('newsCountries.allNews.description')}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Country grid */}
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          {t('newsCountries.browseByCountry')}
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
                  {t('newsCountries.storyCount', { count })}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
