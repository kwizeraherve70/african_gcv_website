import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { X, Zap } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppWidget } from './WhatsAppWidget';

export function Layout() {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dismissible announcement banner */}
      {!bannerDismissed && (
        <div className="relative bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-purple text-white py-2.5 px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Zap className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            <span className="font-medium">GCV Target: 1 π ≈ $314,159 (community-proposed)</span>
            <span className="hidden sm:inline text-white/70">
              {' '}Pay in Pi. Grow together.
            </span>
            <Link
              to="/shop"
              className="underline font-semibold text-brand-gold hover:text-yellow-300 transition-colors flex-shrink-0"
            >
              Explore Market →
            </Link>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
