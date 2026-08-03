import { Link } from 'react-router';
import { useState } from 'react';
import { Clock, Eye, Search, Megaphone, Newspaper, BookOpen } from 'lucide-react';
import { newsArticles, announcements, pressReleases } from '../data/mockData';
import { SEO } from '../components/SEO';

type MainTab = 'articles' | 'announcements' | 'press-releases';
const NEWS_CATEGORIES = ['All', 'Pi Network', 'GCV Movement', 'Events', 'Community'];

export function News() {
  const [activeTab, setActiveTab] = useState<MainTab>('articles');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12">
      <SEO
        title="News & Media"
        description="Stay informed with the latest Pi Network news, GCV movement updates, official announcements, press releases, and community stories from across Africa."
        url="/news"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-2">
            Pi Global GCV Alliance
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">News & Media</h1>
          <p className="text-muted-foreground text-lg">
            Latest updates, announcements, and press releases from the GCV movement
          </p>
        </div>

        {/* Main tabs */}
        <div className="flex flex-wrap gap-1 mb-8 bg-accent/60 rounded-2xl p-1.5">
          {[
            { id: 'articles' as MainTab, label: 'Articles', Icon: Newspaper, count: newsArticles.length },
            { id: 'announcements' as MainTab, label: 'Announcements', Icon: Megaphone, count: announcements.length },
            { id: 'press-releases' as MainTab, label: 'Press Releases', Icon: BookOpen, count: pressReleases.length },
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

        {/* ARTICLES TAB */}
        {activeTab === 'articles' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles…"
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
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </p>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-accent/40 rounded-2xl">
                <p className="text-muted-foreground font-medium mb-1">No articles found</p>
                <p className="text-sm text-muted-foreground">Try a different search term or category</p>
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
            {announcements.map(item => (
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
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.excerpt}</p>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.content }}
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
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
