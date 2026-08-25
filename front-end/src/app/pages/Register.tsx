import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { SEO } from '../components/SEO';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';

export function Register() {
  const { t } = useTranslation('auth');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('register.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 min-h-[70vh] flex items-center bg-accent/40">
      <SEO title="Register" url="/register" noIndex />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl shadow-black/5">
          <div className="w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-5">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">{t('register.title')}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t('register.subtitle')}</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('register.firstNameLabel')}</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('register.firstNamePlaceholder')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('register.lastNameLabel')}</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('register.lastNamePlaceholder')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('register.emailLabel')}</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('register.emailPlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('register.phoneLabel')}</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('register.phonePlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('register.passwordLabel')}</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register.passwordPlaceholder')}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? t('register.submitting') : t('register.submit')}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {t('register.hasAccount')}{' '}
            <Link to="/login" className="text-brand-purple font-medium hover:underline">
              {t('register.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
