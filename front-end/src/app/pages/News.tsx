import { Link, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Search, Megaphone, Newspaper, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Announcement, NewsArticle } from '../types/news';
import { pressReleases, GCV_AFRICA_COUNTRIES } from '../data/mockData';
import { getAllNews } from '../api/news';
import { getAnnouncements } from '../api/announcements';
import { SEO } from '../components/SEO';
import { sanitizeHtml } from '../lib/sanitize';

type MainTab = 'articles' | 'announcements' | 'press-releases';
const NEWS_CATEGORIES = ['All', 'Pi Network', 'GCV Movement', 'Events', 'Community'];
const NEWS_CATEGORY_KEYS: Record<string, string> = {
  All: 'all',
  'Pi Network': 'piNetwork',
  'GCV Movement': 'gcvMovement',
  Events: 'events',
  Community: 'community',
};

export function News() {
  const { t } = useTranslation('news');
  const { country: countrySlug } = useParams();
  const activeCountry = countrySlug ? GCV_AFRICA_COUNTRIES.find(c => c.slug === countrySlug) : undefined;

  const [activeTab, setActiveTab] = useState<MainTab>('articles');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setArticlesError(false);
    getAllNews({ limit: 100 })
      .then(data => {
        if (!cancelled) setNewsArticles(data);
      })
      .catch(() => { if (!cancelled) setArticlesError(true); })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    let cancelled = false;
    setAnnouncementsLoading(true);
    setAnnouncementsError(false);
    getAnnouncements()
      .then(data => { if (!cancelled) setAnnouncements(data); })
      .catch(() => { if (!cancelled) setAnnouncementsError(true); })
      .finally(() => { if (!cancelled) setAnnouncementsLoading(false); });
    return () => { cancelled = true; };
  }, [retry]);

  const filteredArticles = newsArticles.filter(article => {
    const matchesCountry = !activeCountry || article.country === activeCountry.name;
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesCategory && matchesSearch;
  });

  if (countrySlug && !activeCountry) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">{t('news.countryNotFound.title')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('news.countryNotFound.description')}
          </p>
          <Link to="/news" className="inline-flex items-center gap-2 text-brand-purple font-medium hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" />
            {t('news.countryNotFound.backToCountries')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <SEO
        title={activeCountry ? t('news.title.country', { country: activeCountry.name }) : t('news.title.global')}
        description={
          activeCountry
            ? t('news.seo.countryDescription', { country: activeCountry.name })
            : t('news.seo.globalDescription')
        }
        url={activeCountry ? `/news/country/${activeCountry.slug}` : '/news/all'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back to countries */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {activeCountry ? t('news.back.allCountries') : t('news.back.newsHome')}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-2 flex items-center gap-2">
            {activeCountry ? (
              t('news.eyebrow.country', { flag: activeCountry.flag, country: activeCountry.name })
            ) : (
              t('news.eyebrow.global')
            )}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            {activeCountry ? t('news.title.country', { country: activeCountry.name }) : t('news.title.global')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {activeCountry
              ? t('news.subtitle.country', { country: activeCountry.name })
              : t('news.subtitle.global')}
          </p>
        </div>

        {/* Main tabs (global view only) */}
        {!activeCountry && (
          <div className="flex flex-wrap gap-1 mb-8 bg-accent/60 rounded-2xl p-1.5">
            {[
              { id: 'articles' as MainTab, label: t('news.tabs.articles'), Icon: Newspaper, count: newsArticles.length },
              { id: 'announcements' as MainTab, label: t('news.tabs.announcements'), Icon: Megaphone, count: announcements.length },
              { id: 'press-releases' as MainTab, label: t('news.tabs.pressReleases'), Icon: BookOpen, count: pressReleases.length },
            ].map(({ id, label, Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === id ? 'bg-brand-purple/10 text-brand-purple' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ARTICLES TAB */}
        {(activeCountry || activeTab === 'articles') && (
          <>
            {articlesError && (
              <div role="alert" className="mb-6 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
                <p>{t('news.loadError')}</p>
                <button onClick={() => setRetry(value => value + 1)} className="mt-3 font-medium text-brand-purple">{t('news.retry')}</button>
              </div>
            )}
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('news.search.placeholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all text-sm"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {NEWS_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    selectedCategory === cat
                      ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                      : 'bg-accent text-foreground hover:bg-accent/70'
                  }`}
                >
                  {t(`news.filters.categories.${NEWS_CATEGORY_KEYS[cat]}`)}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {loading ? t('news.loadingArticles') : !articlesError && t('news.articleCount', { count: filteredArticles.length })}
            </p>

            {loading ? (
              <div className="text-center py-20 bg-accent/40 rounded-2xl">
                <p className="text-muted-foreground font-medium">{t('news.loadingArticles')}</p>
              </div>
            ) : articlesError ? null : filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-accent/40 rounded-2xl">
                <p className="text-muted-foreground font-medium mb-1">
                  {activeCountry ? t('news.emptyState.noStoriesFromCountry', { country: activeCountry.name }) : t('news.emptyState.noArticlesFound')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeCountry ? t('news.emptyState.checkBackSoon') : t('news.emptyState.tryDifferentSearch')}
                </p>
                {activeCountry && (
                  <Link to="/news/all" className="inline-block mt-4 text-sm font-semibold text-brand-purple hover:underline">
                    {t('news.emptyState.viewAllNews')}
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(article => (
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
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                        <div className="flex items-center gap-3">
                          <span>{article.publishedAt}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {announcementsLoading ? <p role="status" className="py-10 text-center text-muted-foreground">{t('news.loadingAnnouncements')}</p>
              : announcementsError ? (
                <div role="alert" className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
                  <p>{t('news.loadError')}</p>
                  <button onClick={() => setRetry(value => value + 1)} className="mt-3 font-medium text-brand-purple">{t('news.retry')}</button>
                </div>
              ) : announcements.length === 0 ? <p className="py-10 text-center text-muted-foreground">{t('news.noAnnouncements')}</p>
              : announcements.map(item => (
              <div
                key={item.id}
                className={`bg-card rounded-2xl border p-6 ${
                  item.priority === 'high' ? 'border-brand-purple/40' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.priority === 'high'
                      ? 'bg-brand-purple/10'
                      : 'bg-accent'
                  }`}>
                    <Megaphone className={`w-5 h-5 ${item.priority === 'high' ? 'text-brand-purple' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-base leading-tight">{item.title}</h3>
                      {item.priority === 'high' && (
                        <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                          {t('news.important')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.excerpt}</p>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRESS RELEASES TAB */}
        {activeTab === 'press-releases' && (
          <div className="space-y-6">
            {pressReleases.map(item => (
              <div key={item.id} className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {item.source && (
                    <span className="text-xs bg-brand-purple-light/10 text-brand-purple-light px-2.5 py-1 rounded-full font-semibold">
                      {item.source}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-3 leading-tight">{item.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{item.excerpt}</p>
                <div
                  className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
