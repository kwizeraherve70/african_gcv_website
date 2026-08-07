import { Link } from 'react-router';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-ink text-white mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-purple font-bold text-lg leading-none">π</span>
              </div>
              <span className="font-heading font-bold text-base leading-tight">Pi Global GCV<br />Alliance</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A global trade alliance connecting Africa, Europe, Asia, and the USA
              through commerce and collaboration.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { href: 'https://facebook.com', Icon: Facebook, label: 'Facebook' },
                { href: 'https://twitter.com', Icon: Twitter, label: 'Twitter / X' },
                { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram' },
                { href: 'https://youtube.com', Icon: Youtube, label: 'YouTube' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-gold hover:text-brand-purple flex items-center justify-center transition-colors duration-150 flex-shrink-0"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/shop', label: 'GCV Market' },
                { to: '/news', label: 'News & Media' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-gray-400 hover:text-brand-gold text-sm transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Resources
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/merchants', label: 'Merchant Directory' },
                { to: '/industry-alliance', label: 'Industry Alliance' },
                { to: '/team', label: 'Founders' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-gray-400 hover:text-brand-gold text-sm transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Legal
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/terms" className="text-gray-400 hover:text-brand-gold text-sm transition-colors duration-150">
                Terms of Use
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-brand-gold text-sm transition-colors duration-150">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Contact Us
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@gcvalliance.org"
                className="flex items-center gap-2.5 text-gray-400 hover:text-brand-gold text-sm transition-colors duration-150"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@gcvalliance.org
              </a>
              <a
                href="tel:+250788547719"
                className="flex items-center gap-2.5 text-gray-400 hover:text-brand-gold text-sm transition-colors duration-150"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                +250 788 547 719
              </a>
              <a
                href="https://wa.me/250738013858"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-1 px-3.5 py-2 bg-brand-green/15 text-brand-green rounded-lg text-sm font-medium hover:bg-brand-green/25 transition-colors duration-150 w-fit"
              >
                WhatsApp Chat
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Pi Global GCV Alliance. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-150">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-150">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
