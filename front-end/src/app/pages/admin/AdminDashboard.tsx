import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Package, Newspaper, ArrowRight, Plus } from 'lucide-react';
import { getProductCount } from '../../api/products';
import { getNewsCount } from '../../api/news';
import { SEO } from '../../components/SEO';

export function AdminDashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [newsCount, setNewsCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProductCount().then(n => {
      if (!cancelled) setProductCount(n);
    });
    getNewsCount().then(n => {
      if (!cancelled) setNewsCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      label: 'Products',
      count: productCount,
      icon: Package,
      viewTo: '/admin/products',
      newTo: '/admin/products/new',
    },
    {
      label: 'News Articles',
      count: newsCount,
      icon: Newspaper,
      viewTo: '/admin/news',
      newTo: '/admin/news/new',
    },
  ];

  return (
    <div>
      <SEO title="Admin Dashboard" url="/admin" noIndex />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {stats.map(({ label, count, icon: Icon, viewTo, newTo }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <Link
                to={newTo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </Link>
            </div>
            <p className="text-3xl font-bold mb-1">{count ?? '—'}</p>
            <p className="text-sm text-muted-foreground mb-4">{label}</p>
            <Link
              to={viewTo}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
            >
              Manage {label.toLowerCase()}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
