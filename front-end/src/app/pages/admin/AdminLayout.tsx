import { Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, Package, Newspaper, ShoppingCart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/contacts', label: 'Messages', icon: MessageSquare },
  { to: '/admin/news', label: 'News', icon: Newspaper },
];

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-1">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.firstName}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside>
            <nav className="flex lg:flex-col gap-1 bg-card rounded-2xl border border-border p-2 overflow-x-auto lg:overflow-visible">
              {NAV.map(({ to, label, icon: Icon, exact }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                    isActive(to, exact)
                      ? 'text-brand-purple bg-brand-purple/10'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
