import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { X, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GCV_USD } from '../lib/pi';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppWidget } from './WhatsAppWidget';

export function Layout() {
  const { t } = useTranslation('common');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dismissible announcement banner */}
      {!bannerDismissed && (
        <div className="relative bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-purple text-white py-2.5 px-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <Zap className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            <span className="font-medium">{t('announcement.target', { value: GCV_USD.toLocaleString('en-US') })}</span>
            <span className="hidden sm:inline text-white/70">
              {t('announcement.tagline')}
            </span>
            <Link
              to="/shop"
              className="underline font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors flex-shrink-0"
            >
              {t('announcement.exploreMarket')}
            </Link>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={t('announcement.dismiss')}
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
