import { useTranslation } from 'react-i18next';
import { Users, Target, Award, Globe } from 'lucide-react';
import { SEO } from '../components/SEO';
import dorisImg from '@/assets/doris .jpg';
import olivierImg from '@/assets/olivie.jpeg';
import missionImg from '@/assets/mission.jpg';
import { GCV_USD } from '../lib/pi';

const CORE_VALUES_META = [
  { Icon: Users, gradient: 'from-brand-purple to-brand-purple-light' },
  { Icon: Target, gradient: 'from-brand-gold to-yellow-400' },
  { Icon: Award, gradient: 'from-brand-purple-light to-purple-400' },
  { Icon: Globe, gradient: 'from-brand-green to-emerald-400' },
];

const ALLIANCE_REGIONS = [
  { key: 'africa', color: '#5b21b6' },
  { key: 'europe', color: '#7c3aed' },
  { key: 'asia', color: '#fbbf24' },
  { key: 'usa', color: '#10b981' },
];

export function About() {
  const { t } = useTranslation('about');

  const coreValueItems = t('about.values.items', { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];
  const gcvPrinciples = t('about.gcv.principles', { returnObjects: true }) as string[];
  const impactStats = t('about.impact.stats', { returnObjects: true }) as {
    value: string;
    label: string;
  }[];

  return (
    <div>
      <SEO
        title={t('about.seo.title')}
        description={t('about.seo.description')}
        url="/about"
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
            {t('about.hero.eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-5 tracking-tight max-w-2xl leading-tight">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── MISSION ──────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
                {t('about.mission.eyebrow')}
              </p>
              <h2 className="text-3xl font-heading font-bold mb-5 tracking-tight">{t('about.mission.title')}</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about.mission.paragraph1')}
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about.mission.paragraph2')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.mission.paragraph3')}
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-brand-purple/15 to-brand-gold/15 rounded-3xl blur-xl pointer-events-none" />
              <div className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border">
                <img
                  src={missionImg}
                  alt={t('about.mission.imageAlt')}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE VALUES ──────────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              {t('about.values.eyebrow')}
            </p>
            <h2 className="text-3xl font-heading font-bold tracking-tight">{t('about.values.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES_META.map(({ Icon, gradient }, index) => {
              const { title, desc } = coreValueItems[index];
              return (
                <div
                  key={title}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── GCV EXPLANATION ──────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-brand-surface rounded-2xl p-8 md:p-10">
            <h2 className="text-3xl font-heading font-bold mb-2 tracking-tight">
              {t('about.gcv.title')}
            </h2>
            <p className="text-3xl font-bold text-brand-purple mb-4">
              {t('about.gcv.rateDisplay', { value: GCV_USD.toLocaleString('en-US') })}
            </p>
            <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong className="text-foreground">{t('about.gcv.disclaimerStrong')}</strong>{' '}
                {t('about.gcv.disclaimerRest')}
              </p>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                {t('about.gcv.paragraph1Before')}{' '}
                <strong className="text-foreground">
                  {t('about.gcv.rateDisplay', { value: GCV_USD.toLocaleString('en-US') })}
                </strong>{' '}
                {t('about.gcv.paragraph1After')}
              </p>
              <p className="leading-relaxed">
                {t('about.gcv.paragraph2')}
              </p>
              <p className="font-medium text-foreground">{t('about.gcv.principlesLabel')}</p>
              <ul className="space-y-2 ml-4">
                {gcvPrinciples.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="leading-relaxed">
                {t('about.gcv.paragraph3')}
              </p>
            </div>
          </div>
        </section>

        {/* ── LEADERSHIP ───────────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="mb-12">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              {t('about.leadership.eyebrow')}
            </p>
            <h2 className="text-3xl font-heading font-bold tracking-tight">{t('about.leadership.title')}</h2>
          </div>

          {/* Doris Yin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-14">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-brand-gold/20 to-brand-purple-light/15 rounded-2xl blur-lg pointer-events-none" />
              <div className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-border">
                <img src={dorisImg} alt={t('about.leadership.doris.name')} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-2xl font-heading font-bold mb-1 tracking-tight">{t('about.leadership.doris.name')}</h3>
              <p className="text-brand-gold font-semibold text-sm mb-5">
                {t('about.leadership.doris.role')}
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about.leadership.doris.bio1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.leadership.doris.bio2')}
              </p>
            </div>
          </div>

          {/* Olivier Ndatimana */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-brand-purple/20 to-brand-purple-light/15 rounded-2xl blur-lg pointer-events-none" />
              <div className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-border">
                <img src={olivierImg} alt={t('about.leadership.olivier.name')} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-2xl font-heading font-bold mb-1 tracking-tight">{t('about.leadership.olivier.name')}</h3>
              <p className="text-brand-gold font-semibold text-sm mb-5">
                {t('about.leadership.olivier.role')}
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about.leadership.olivier.bio1')}
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about.leadership.olivier.bio2')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.leadership.olivier.bio3')}
              </p>
            </div>
          </div>
        </section>

        {/* ── ALLIANCE REGIONS ─────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-brand-surface rounded-2xl p-8 md:p-10">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              {t('about.regionsSection.eyebrow')}
            </p>
            <h2 className="text-3xl font-heading font-bold mb-4 tracking-tight">
              {t('about.regionsSection.title')}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              {t('about.regionsSection.description')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ALLIANCE_REGIONS.map(({ key, color }) => {
                const label = t(`regions.${key}`);
                return (
                  <div
                    key={key}
                    className="bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {label[0]}
                    </div>
                    <p className="font-semibold text-xs leading-tight">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ALLIANCE IMPACT ──────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-gradient-to-br from-brand-purple to-brand-purple-light text-white rounded-2xl p-8 md:p-10 mb-16">
            <h2 className="text-3xl font-heading font-bold text-center mb-10 tracking-tight">
              {t('about.impact.title')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {impactStats.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-4xl font-bold mb-2">{value}</div>
                  <div className="text-white/80 text-sm font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
