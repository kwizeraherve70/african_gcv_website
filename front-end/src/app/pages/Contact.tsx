import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';
import { createContact } from '../api/contact';
import { ApiError } from '../api/client';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';

// Kept in English regardless of UI language: this label is embedded into the
// contact message body sent to the backend/admin inbox, not shown as JSX.
const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  gcv: 'GCV Questions',
  membership: 'Membership & Registration',
  products: 'Product Support',
  partnership: 'Partnership Opportunity',
  other: 'Other',
};

export function Contact() {
  const { t } = useTranslation('contact');
  const faqItems = t('faq.items', { returnObjects: true }) as { q: string; a: string }[];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const subjectLabel = SUBJECT_LABELS[formData.subject] ?? formData.subject;
      await createContact({
        name: formData.name,
        email: formData.email,
        message: `[${subjectLabel}] ${formData.message}`,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : t('form.genericError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="py-12">
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        url="/contact"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
            {t('header.eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{t('header.title')}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {t('header.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact info sidebar */}
          <div className="space-y-4">
            {[
              {
                Icon: Mail,
                gradient: 'from-brand-purple to-purple-400',
                title: t('info.email.title'),
                value: t('info.email.value'),
              },
              {
                Icon: Phone,
                gradient: 'from-brand-gold to-yellow-300',
                title: t('info.phone.title'),
                value: t('info.phone.value'),
              },
              {
                Icon: MapPin,
                gradient: 'from-brand-purple-light to-purple-400',
                title: t('info.office.title'),
                value: t('info.office.value'),
              },
            ].map(({ Icon, gradient, title, value }) => (
              <div
                key={title}
                className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {value}
                  </p>
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="bg-accent/50 rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">{t('social.title')}</h3>
              <div className="flex gap-2">
                {[
                  { href: 'https://twitter.com', label: 'X' },
                  { href: 'https://t.me', label: 'TG' },
                ].map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-brand-purple text-white rounded-xl flex items-center justify-center text-xs font-bold hover:bg-brand-purple-light transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-14">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{t('form.success.title')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('form.success.description')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-medium text-brand-purple hover:underline"
                  >
                    {t('form.success.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t('form.nameLabel')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t('form.namePlaceholder')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t('form.emailLabel')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t('form.emailPlaceholder')}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium mb-1.5">{t('form.subjectLabel')}</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">{t('form.subjectPlaceholder')}</option>
                      <option value="general">{t('form.subjectOptions.general')}</option>
                      <option value="gcv">{t('form.subjectOptions.gcv')}</option>
                      <option value="membership">{t('form.subjectOptions.membership')}</option>
                      <option value="products">{t('form.subjectOptions.products')}</option>
                      <option value="partnership">{t('form.subjectOptions.partnership')}</option>
                      <option value="other">{t('form.subjectOptions.other')}</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1.5">{t('form.messageLabel')}</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder={t('form.messagePlaceholder')}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {submitError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? t('form.submitting') : t('form.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              {t('map.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight">{t('map.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('map.address')}</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-md">
            <iframe
              title={t('map.iframeTitle')}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5017859628794!2d30.0588!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42f4e2a4c9f%3A0x4f4b4f4f4f4f4f4f!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1690000000000!5m2!1sen!2srw"
              width="100%"
              height="400"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              {t('faq.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight">{t('faq.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqItems.map(({ q, a }) => (
              <div
                key={q}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
