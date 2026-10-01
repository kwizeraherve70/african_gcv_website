import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useTeamPage } from '../hooks/useTeam';
import { TeamPortrait } from '../components/team/TeamPortrait';
import { TeamContentState } from '../components/team/TeamContentState';
import { SEO } from '../components/SEO';
import { Users, Globe, Star } from 'lucide-react';

const REGION_COLORS: Record<string, string> = {
  Africa: 'from-brand-purple to-brand-purple-light',
  Europe: 'from-brand-purple-light to-brand-purple',
  Asia: 'from-brand-gold to-brand-gold/60',
  USA: 'from-brand-green to-brand-green/60',
};

export function Team() {
  const { hash } = useLocation();
  const { t } = useTranslation('about');
  const resource = useTeamPage();
  const snapshot = resource.data;

  useEffect(() => {
    if (!hash || !snapshot) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, snapshot]);

  if (!snapshot) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SEO title={t('team.seo.title')} url="/team" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">{t('team.hero.title')}</h1>
        <TeamContentState status={resource.status === 'error' ? 'error' : 'loading'} onRetry={resource.retry} />
      </div>
    );
  }

  const leadershipMembers = snapshot.sections.LEADERSHIP;
  const localizedFounders = snapshot.sections.FOUNDERS;
  const departmentMembers = snapshot.sections.DEPARTMENTS;
  const copy = snapshot.page;

  return (
    <div>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        url="/team"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Users className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-medium">{copy.heroBadge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{copy.heroTitle}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            {copy.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Global Leadership */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-purple-light rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest">{copy.leadershipEyebrow}</p>
              <h2 className="text-2xl font-bold tracking-tight">{copy.leadershipTitle}</h2>
            </div>
          </div>

          {leadershipMembers.length === 0 && <p className="text-muted-foreground text-sm">{t('team.ui.empty')}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadershipMembers.map(member => (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border p-6 flex gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <TeamPortrait
                  src={member.photoUrl}
                  name={member.fullName}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg leading-tight">{member.fullName}</h3>
                    <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {member.country}
                    </span>
                  </div>
                  <div className="mb-3 space-y-1">
                    <p className="text-sm text-brand-purple font-medium">{member.title}</p>
                    {member.secondaryTitle && (
                      <p className="text-xs text-brand-purple font-medium">{member.secondaryTitle}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{member.bio}</p>
                  {member.profilePath && (
                    <Link to={member.profilePath} className="inline-block mt-3 text-sm font-medium text-brand-purple hover:underline">
                      {t('team.ui.profileLink')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founders */}
        <div id="founders" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-purple-light rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest">{copy.foundersEyebrow}</p>
              <h2 className="text-2xl font-bold tracking-tight">{copy.foundersTitle}</h2>
            </div>
          </div>

          {localizedFounders.length === 0 && <p className="text-muted-foreground text-sm">{t('team.ui.empty')}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedFounders.map(founder => (
              <div
                key={founder.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`h-20 bg-gradient-to-br ${REGION_COLORS[founder.region ?? ''] || 'from-brand-purple to-brand-purple-light'} relative`}>
                  <div className="absolute -bottom-8 left-5">
                    <TeamPortrait
                      src={founder.photoUrl}
                      name={founder.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-card shadow-lg"
                    />
                  </div>
                  <div className="absolute top-3 right-4">
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                      {founder.region}
                    </span>
                  </div>
                </div>

                <div className="pt-10 p-5">
                  <h3 className="font-bold text-base mb-0.5">{founder.fullName}</h3>
                  <p className="text-xs text-brand-purple font-semibold mb-1">{founder.title}</p>
                  {founder.secondaryTitle && <p className="text-xs text-brand-purple mb-1">{founder.secondaryTitle}</p>}
                  <p className="text-xs text-muted-foreground mb-3">{founder.country}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{founder.bio}</p>
                  {founder.profilePath && (
                    <Link to={founder.profilePath} className="inline-block mt-3 text-sm font-medium text-brand-purple hover:underline">
                      {t('team.ui.profileLink')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Structure */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-gold rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest">{copy.departmentsEyebrow}</p>
              <h2 className="text-2xl font-bold tracking-tight">{copy.departmentsTitle}</h2>
            </div>
          </div>

          {/* Department labels */}
          <div className="flex flex-wrap gap-2 mb-8">
            {snapshot.departments.map(dept => (
              <span
                key={dept.id}
                className="px-3 py-1.5 bg-accent rounded-lg text-sm font-medium text-muted-foreground"
              >
                {dept.name}
              </span>
            ))}
          </div>

          {departmentMembers.length === 0 && <p className="text-muted-foreground text-sm">{t('team.ui.empty')}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departmentMembers.map(member => (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <TeamPortrait
                    src={member.photoUrl}
                    name={member.fullName}
                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{member.fullName}</h3>
                    <p className="text-xs text-brand-purple font-medium mt-0.5">{member.departmentName}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground mb-2 leading-snug">{member.title}</p>
                {member.secondaryTitle && <p className="text-xs text-brand-purple mb-2">{member.secondaryTitle}</p>}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{member.bio}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{member.country}</span>
                  <span className="text-xs bg-accent px-2 py-0.5 rounded-full">{member.departmentName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
