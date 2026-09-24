import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingCart, Menu, X, ChevronDown, Search, User, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n';

function ThemeToggle() {
  const { t } = useTranslation('common');
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
      aria-label={isDark ? t('navbar.themeToggle.switchToLight') : t('navbar.themeToggle.switchToDark')}
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

function useNavGroups(): NavGroup[] {
  const { t } = useTranslation('common');
  return [
    { label: t('navbar.links.home'), to: '/' },
    { label: t('navbar.links.about'), to: '/about' },
    { label: t('navbar.links.team'), to: '/team' },
    { label: t('navbar.links.founders'), to: '/team#founders' },
    { label: t('navbar.links.allianceGroup'), to: '/industry-alliance' },
    { label: t('navbar.links.market'), to: '/shop' },
    { label: t('navbar.links.news'), to: '/news' },
    { label: t('navbar.links.contact'), to: '/contact' },
  ];
}

function LanguageSelector() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep this control in sync with the shared i18n instance rather than
  // holding its own copy of the active language (which could drift).
  useEffect(() => {
    const onLanguageChanged = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', onLanguageChanged);
    return () => i18n.off('languageChanged', onLanguageChanged);
  }, []);

  const activeCode = (i18n.language || 'en').split('-')[0];

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors duration-150"
        aria-label={t('navbar.language.selectLanguage')}
      >
        {activeCode.toUpperCase()}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-24 bg-card rounded-xl border border-border shadow-xl py-1.5 z-50">
          {SUPPORTED_LANGUAGES.map(({ code }) => (
            <button
              key={code}
              onClick={() => { i18n.changeLanguage(code); setOpen(false); }}
              className={`w-full text-left px-3.5 py-1.5 text-sm hover:bg-accent transition-colors duration-100 ${
                activeCode === code ? 'text-brand-purple font-semibold' : 'text-foreground'
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ user, size = 'sm' }: { user: { firstName: string; lastName: string; photo?: string | null }; size?: 'sm' | 'md' }) {
  const dimensions = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

  if (user.photo) {
    return (
      <img
        src={user.photo}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${dimensions} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dimensions} rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold flex-shrink-0`}
    >
      {user.firstName[0]}
      {user.lastName[0]}
    </div>
  );
}

function AccountMenu() {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="hidden md:flex items-center gap-2 ml-1">
        <Link
          to="/login"
          className="px-3.5 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors duration-150"
        >
          {t('navbar.account.login')}
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors duration-150 inline-flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5" />
          {t('navbar.account.register')}
        </Link>
      </div>
    );
  }

  const primaryRole = user.roles.includes('ADMIN')
    ? t('navbar.account.roleAdmin')
    : user.roles.includes('MERCHANT')
    ? t('navbar.account.roleMerchant')
    : t('navbar.account.roleMember');

  return (
    <div ref={ref} className="relative hidden md:block ml-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-accent transition-colors duration-150"
      >
        <Avatar user={user} />
        <span className="text-sm font-medium max-w-[100px] truncate">{user.firstName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-52 bg-card rounded-xl border border-border shadow-xl py-1.5 z-50">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border mb-1">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{primaryRole}</p>
            </div>
          </div>
          {user.roles.includes('ADMIN') && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-100"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t('navbar.account.adminPortal')}
            </Link>
          )}
          <button
            onClick={() => {
              setOpen(false);
              void logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 text-left px-3.5 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('navbar.account.logout')}
          </button>
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
  const { t } = useTranslation('common');
  const NAV_GROUPS = useNavGroups();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
              aria-label={t('navbar.search')}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <LanguageSelector />

            <ThemeToggle />

            <Link
              to="/cart"
              className="relative p-2.5 hover:bg-accent rounded-xl transition-colors duration-150"
              aria-label={t('navbar.cart.aria', { count: itemCount })}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-purple text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                  {itemCount}
                </span>
              )}
            </Link>

            <AccountMenu />

            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="lg:hidden p-2.5 hover:bg-accent rounded-xl transition-colors duration-150"
              aria-label={isMenuOpen ? t('navbar.menu.close') : t('navbar.menu.open')}
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
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between gap-2 mt-3 px-3">
                  <span className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={() => {
                      void logout();
                      navigate('/');
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-accent transition-colors duration-150 flex-shrink-0"
                  >
                    {t('navbar.account.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-3 px-3">
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors duration-150"
                  >
                    {t('navbar.account.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purple-light transition-colors duration-150"
                  >
                    {t('navbar.account.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
