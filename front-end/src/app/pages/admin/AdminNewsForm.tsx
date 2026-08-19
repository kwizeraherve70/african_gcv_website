import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import {
  getAdminNews,
  createNews,
  updateNews,
  NEWS_CATEGORIES,
  type NewsInput,
  type AdminNewsCategory,
} from '../../api/news';
import { GCV_AFRICA_COUNTRIES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';
import { ImageUploadField } from '../../components/admin/ImageUploadField';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';
const labelClass = 'block text-sm font-medium mb-1.5';

const EMPTY_FORM: NewsInput = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  category: 'GCV_MOVEMENT',
  author: '',
  readTime: '',
  country: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminNewsForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<NewsInput>(EMPTY_FORM);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    getAdminNews(id)
      .then(n => {
        setForm({
          title: n.title,
          slug: n.slug,
          excerpt: n.excerpt,
          content: n.content,
          featuredImage: n.featuredImage,
          category: n.category,
          author: n.author,
          readTime: n.readTime,
          country: n.country ?? '',
        });
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load article.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'title' && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
    if (name === 'slug') setSlugTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!featuredImageFile && !form.featuredImage) {
      setError('Please choose a featured image.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = { ...form, country: form.country || undefined };
      if (isEdit && id) {
        await updateNews(id, payload, token, featuredImageFile ?? undefined);
      } else {
        await createNews(payload, token, featuredImageFile ?? undefined);
      }
      navigate('/admin/news');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save article.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <div>
      <SEO title={isEdit ? 'Edit Article' : 'New Article'} url="/admin/news" noIndex />
      <Link
        to="/admin/news"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to News
      </Link>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
        <h2 className="text-lg font-bold tracking-tight mb-6">
          {isEdit ? 'Edit Article' : 'New Article'}
        </h2>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Title *</label>
              <input type="text" name="title" required value={form.title} onChange={handleChange} className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Slug *</label>
              <input type="text" name="slug" required value={form.slug} onChange={handleChange} className={`${inputClass} font-mono text-xs`} />
              <p className="text-xs text-muted-foreground mt-1">Used in the article URL — auto-filled from the title until edited directly.</p>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Excerpt *</label>
              <input type="text" name="excerpt" required value={form.excerpt} onChange={handleChange} placeholder="One-sentence summary shown on article cards" className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Content (HTML) *</label>
              <textarea name="content" required rows={6} value={form.content} onChange={handleChange} placeholder="<p>Full article body…</p>" className={`${inputClass} font-mono text-xs`} />
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select name="category" required value={form.category} onChange={handleChange} className={inputClass}>
                {NEWS_CATEGORIES.map(({ value, label }: { value: AdminNewsCategory; label: string }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <select name="country" value={form.country} onChange={handleChange} className={inputClass}>
                <option value="">Pan-African / global (no country)</option>
                {GCV_AFRICA_COUNTRIES.map(c => (
                  <option key={c.slug} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Author *</label>
              <input type="text" name="author" required value={form.author} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Read Time *</label>
              <input type="text" name="readTime" required value={form.readTime} onChange={handleChange} placeholder="5 min" className={inputClass} />
            </div>

            <ImageUploadField
              label="Featured Image *"
              existingUrl={form.featuredImage || undefined}
              onFileChange={setFeaturedImageFile}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple-light transition-colors shadow-lg shadow-brand-purple/20 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Article'}
            </button>
            <Link
              to="/admin/news"
              className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
