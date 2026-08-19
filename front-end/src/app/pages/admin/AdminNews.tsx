import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAllNews, deleteNews } from '../../api/news';
import type { NewsArticle } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';

export function AdminNews() {
  const { token } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllNews({ limit: 100 })
      .then(setArticles)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load articles.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (article: NewsArticle) => {
    if (!token) return;
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    setDeletingId(article.id);
    try {
      await deleteNews(article.id, token);
      setArticles(prev => prev.filter(a => a.id !== article.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete article.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <SEO title="Manage News" url="/admin/news" noIndex />
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold tracking-tight">News Articles</h2>
        <Link
          to="/admin/news/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors shadow-lg shadow-brand-purple/20"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Loading articles…</p>
        ) : articles.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No articles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Published</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium max-w-xs truncate">{article.title}</td>
                    <td className="px-5 py-3 text-muted-foreground">{article.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{article.country ?? '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground">{article.publishedAt}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/news/${article.id}/edit`}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          aria-label={`Edit ${article.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article)}
                          disabled={deletingId === article.id}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${article.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
