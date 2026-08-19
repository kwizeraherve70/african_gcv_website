import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import {
  getAdminProduct,
  createProduct,
  updateProduct,
  PRODUCT_CATEGORIES,
  type ProductInput,
  type AdminProductCategory,
} from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';
import { ImageUploadField } from '../../components/admin/ImageUploadField';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';
const labelClass = 'block text-sm font-medium mb-1.5';

const EMPTY_FORM: ProductInput = {
  name: '',
  teaser: '',
  description: '',
  price: 0,
  discountPercentage: undefined,
  category: 'SEDANS',
  brand: '',
  model: '',
  warranty: '',
  stockQuantity: 0,
  thumbnail: '',
  isFeatured: false,
};

export function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    getAdminProduct(id)
      .then(p => {
        setForm({
          name: p.name,
          teaser: p.teaser,
          description: p.description,
          price: p.price,
          discountPercentage: p.discountPercentage ?? undefined,
          category: p.category,
          brand: p.brand ?? '',
          model: p.model ?? '',
          warranty: p.warranty ?? '',
          stockQuantity: p.stockQuantity,
          thumbnail: p.thumbnail,
          isFeatured: p.isFeatured,
        });
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value === '' ? undefined : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!thumbnailFile && !form.thumbnail) {
      setError('Please choose a thumbnail image.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateProduct(id, form, token, thumbnailFile ?? undefined);
      } else {
        await createProduct(form, token, thumbnailFile ?? undefined);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <div>
      <SEO title={isEdit ? 'Edit Product' : 'New Product'} url="/admin/products" noIndex />
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
        <h2 className="text-lg font-bold tracking-tight mb-6">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h2>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Tesla Model S Plaid"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Short Description (teaser) *</label>
              <input
                type="text"
                name="teaser"
                required
                value={form.teaser}
                onChange={handleChange}
                placeholder="Blazing fast electric luxury sedan"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Full Description (HTML) *</label>
              <textarea
                name="description"
                required
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="<p>Full product description…</p>"
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Rendered as HTML on the product page — basic tags only (p, ul, li, strong).
              </p>
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select name="category" required value={form.category} onChange={handleChange} className={inputClass}>
                {PRODUCT_CATEGORIES.map(({ value, label }: { value: AdminProductCategory; label: string }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="Tesla" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Model</label>
              <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="Model S Plaid" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Warranty</label>
              <input type="text" name="warranty" value={form.warranty} onChange={handleChange} placeholder="4-year / 50,000-mile" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Price (USD) *</label>
              <input type="number" name="price" required min={0} step="0.01" value={form.price} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Discount %</label>
              <input type="number" name="discountPercentage" min={0} max={100} value={form.discountPercentage ?? ''} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Stock Quantity *</label>
              <input type="number" name="stockQuantity" required min={0} value={form.stockQuantity} onChange={handleChange} className={inputClass} />
            </div>

            <ImageUploadField
              label="Thumbnail Image *"
              existingUrl={form.thumbnail || undefined}
              onFileChange={setThumbnailFile}
            />

            <div className="md:col-span-2 flex items-center gap-2.5">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={!!form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-purple rounded"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium">
                Featured on homepage
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple-light transition-colors shadow-lg shadow-brand-purple/20 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <Link
              to="/admin/products"
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
