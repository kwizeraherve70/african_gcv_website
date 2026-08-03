import { useParams, Link } from 'react-router';
import { ArrowLeft, Clock, Eye, Share2, Calendar } from 'lucide-react';
import { newsArticles } from '../data/mockData';
import { SEO } from '../components/SEO';

export function NewsDetail() {
  const { slug } = useParams();
  const article = newsArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-brand-purple font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  const relatedArticles = newsArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="py-10">
      <SEO
        title={article.title}
        description={article.excerpt}
        image={article.featuredImage}
        url={`/news/${article.slug}`}
        type="article"
        publishedAt={article.publishedAt}
        author={article.author}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to News
        </Link>

        {/* Article header */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-brand-purple/10 text-brand-purple text-sm font-semibold rounded-full mb-5">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight leading-snug">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {article.viewCount.toLocaleString()} views
            </span>
            <span className="text-muted-foreground">By {article.author}</span>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/70 rounded-xl text-sm font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            Share Article
          </button>
        </div>

        {/* Featured image */}
        <div className="aspect-video rounded-2xl overflow-hidden mb-10 bg-accent">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-14"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-14 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map(related => (
                <Link
                  key={related.id}
                  to={`/news/${related.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden bg-accent">
                    <img
                      src={related.featuredImage}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-0.5 bg-brand-purple/10 text-brand-purple text-xs font-semibold rounded-full mb-2">
                      {related.category}
                    </span>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{related.publishedAt}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <span>{related.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
