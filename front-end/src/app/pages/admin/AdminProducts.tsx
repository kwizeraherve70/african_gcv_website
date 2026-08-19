import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAllProducts } from '../../api/products';
import type { Product } from '../../data/mockData';
import { deleteProduct } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';

export function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllProducts({ limit: 100 })
      .then(setProducts)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (product: Product) => {
    if (!token) return;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, token);
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <SEO title="Manage Products" url="/admin/products" noIndex />
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold tracking-tight">Products</h2>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors shadow-lg shadow-brand-purple/20"
        >
          <Plus className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-accent flex-shrink-0"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{product.category}</td>
                    <td className="px-5 py-3">${product.price.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      {product.inventory === 0 ? (
                        <span className="text-red-500 font-medium">Out of stock</span>
                      ) : (
                        product.inventory
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${product.name}`}
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
