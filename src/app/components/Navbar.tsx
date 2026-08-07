import { Link, useLocation } from 'react-router';
import { ShoppingCart, Menu, X, ChevronDown, Search, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useCart } from '../context/CartContext';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="p-2.5 w-[42px] h-[42px]" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2.5 hover:bg-accent rounded-xl transition-colors duration-150"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}

interface NavGroup {
  label: string;
  to?: string;
  children?: { to: string; label: string; description?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Home', to: '/' },
  {
    label: 'About Us',
    children: [
      { to: '/about', label: 'Our Story', description: 'Mission, values & leadership' },
      { to: '/team', label: 'Core Team', description: 'Global leadership, founders & departments' },
    ],
  },
  { label: 'GCV Market', to: '/shop' },
  { label: 'News & Media', to: '/news' },
  { label: 'Contact Us', to: '/contact' },
];

const LANGUAGES = ['EN', 'FR', 'RW', 'SW'];

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors duration-150"
        aria-label="Select language"
      >
        {lang}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-24 bg-card rounded-xl border border-border shadow-xl py-1.5 z-50">
          {LANGUAGES.map(code => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full text-left px-3.5 py-1.5 text-sm hover:bg-accent transition-colors duration-100 ${
                lang === code ? 'text-brand-purple font-semibold' : 'text-foreground'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownMenu({ group, isActive }: { group: NavGroup; isActive: (path: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isGroupActive = group.children?.some(child => isActive(child.to));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isGroupActive
            ? 'text-brand-purple bg-brand-purple/10'
            : 'text-foreground/70 hover:text-foreground hover:bg-accent'
        }`}
      >
        {group.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-card rounded-xl border border-border shadow-xl shadow-black/10 py-1.5 z-50">
          {group.children?.map(child => (
            <Link
              key={child.to}
              to={child.to}
              onClick={() => setOpen(false)}
              className={`flex flex-col px-3.5 py-2.5 hover:bg-accent transition-colors duration-100 ${
                isActive(child.to) ? 'text-brand-purple' : 'text-foreground'
              }`}
            >
              <span className="text-sm font-medium">{child.label}</span>
              {child.description && (
                <span className="text-xs text-muted-foreground mt-0.5">{child.description}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setExpandedGroup(null);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-border/60'
          : 'bg-background border-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 bg-brand-gold rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <span className="text-brand-purple font-bold text-lg leading-none">π</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-heading font-bold text-[15px] tracking-tight">Pi Global GCV</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Alliance</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_GROUPS.map(group => (
              group.to ? (
                <Link
                  key={group.to}
                  to={group.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(group.to)
                      ? 'text-brand-purple bg-brand-purple/10'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {group.label}
                </Link>
              ) : (
                <DropdownMenu key={group.label} group={group} isActive={isActive} />
              )
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              className="hidden md:flex p-2.5 hover:bg-accent rounded-xl transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <LanguageSelector />

            <ThemeToggle />

            <Link
              to="/cart"
              className="relative p-2.5 hover:bg-accent rounded-xl transition-colors duration-150"
              aria-label={`Shopping cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-purple text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-1">
              <Link
                to="/contact"
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors duration-150"
              >
                Login
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors duration-150 inline-flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Register
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="lg:hidden p-2.5 hover:bg-accent rounded-xl transition-colors duration-150"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-border/60 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-0.5">
              {NAV_GROUPS.map(group => (
                group.to ? (
                  <Link
                    key={group.to}
                    to={group.to}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive(group.to)
                        ? 'text-brand-purple bg-brand-purple/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {group.label}
                  </Link>
                ) : (
                  <div key={group.label}>
                    <button
                      onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors duration-150"
                    >
                      {group.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroup === group.label ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedGroup === group.label && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-3">
                        {group.children?.map(child => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`block px-2 py-2 rounded-lg text-sm transition-colors duration-150 ${
                              isActive(child.to)
                                ? 'text-brand-purple font-medium'
                                : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
              <div className="flex gap-2 mt-3 px-3">
                <Link
                  to="/contact"
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/contact"
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors duration-150"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
