import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { SEO } from '../components/SEO';
import { createContact } from '../api/contact';
import { ApiError } from '../api/client';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  gcv: 'GCV Questions',
  membership: 'Membership & Registration',
  products: 'Product Support',
  partnership: 'Partnership Opportunity',
  other: 'Other',
};

const FAQ_ITEMS = [
  {
    q: 'What is GCV?',
    a: 'Global Consensus Value is a community-proposed price target — 1 π ≈ $314,159 — used consistently across the GCV Market. It is not an official Pi Network rate and is not endorsed by the Pi Core Team or verified on any exchange; Pi\'s actual open-market price is far lower.',
  },
  {
    q: 'How do I join the Alliance?',
    a: 'Register as a member to browse and buy in the GCV Market, or register your business as a GCV Merchant. Use the form below or the Register button in the navigation.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Physical products can be returned within 30 days. Digital products are non-refundable once accessed. See our terms for details.',
  },
  {
    q: 'How can I become an Ambassador?',
    a: "Contact us to learn about our Ambassador programme. We're always looking for passionate members to help grow the Alliance in their region.",
  },
];

export function Contact() {
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
        err instanceof ApiError ? err.message : 'Could not send your message. Please try again.'
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
        title="Contact Us"
        description="Get in touch with Pi Global GCV Alliance. Reach us by email, phone, or visit our office in Kigali, Rwanda."
        url="/contact"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Have questions about the GCV Market or membership? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact info sidebar */}
          <div className="space-y-4">
            {[
              {
                Icon: Mail,
                gradient: 'from-brand-purple to-purple-400',
                title: 'Email',
                value: 'info@gcvalliance.org',
              },
              {
                Icon: Phone,
                gradient: 'from-brand-gold to-yellow-300',
                title: 'Phone',
                value: '+250 788 547 719',
              },
              {
                Icon: MapPin,
                gradient: 'from-brand-purple-light to-purple-400',
                title: 'Office Address',
                value: 'KG 11 Ave, Kiyovu\nKigali, Rwanda\nServing members across Africa, Europe, Asia, and the USA',
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
              <h3 className="font-semibold text-sm mb-4">Follow Us</h3>
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
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for contacting us. Check your inbox for a confirmation — we'll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-medium text-brand-purple hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium mb-1.5">Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="gcv">GCV Questions</option>
                      <option value="membership">Membership & Registration</option>
                      <option value="products">Product Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1.5">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help you…"
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
                    {submitting ? 'Sending…' : 'Send Message'}
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
              Find Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Our Location</h2>
            <p className="text-muted-foreground mt-2">KG 11 Ave, Kiyovu, Kigali, Rwanda</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-md">
            <iframe
              title="Pi Global GCV Alliance — Kigali Office"
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
              Common Questions
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQ_ITEMS.map(({ q, a }) => (
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
