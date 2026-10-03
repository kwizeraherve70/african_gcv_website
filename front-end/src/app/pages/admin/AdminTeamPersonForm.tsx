import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { TEAM_ADMIN_ROUTES, teamPersonEditPath } from '../../lib/teamRoutes';
import { ArrowLeft } from 'lucide-react';
import { getAdminTeam, getAdminTeamPerson, saveTeamPerson } from '../../api/team';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/SEO';
import { TEAM_SECTIONS, type AdminTeamDepartment, type LocalizedText, type TeamLocale, type TeamPersonInput, type TeamPlacementInput, type TeamSection, type TeamTitleSource } from '../../types/team';
import { TeamLocaleTabs, TeamLocalizedField, TeamNotice, TeamPhotoField, teamButtonClass, teamInputClass, teamSecondaryButtonClass } from '../../components/admin/TeamEditorFields';

const SECTION_NAMES: Record<TeamSection, string> = { LEADERSHIP: 'Global Leadership', FOUNDERS: 'Founders', DEPARTMENTS: 'Department Teams' };
const TITLE_NAMES: Record<TeamTitleSource, string> = { PRIMARY: 'Shared primary title', SECONDARY: 'Shared secondary title', CUSTOM: 'Custom title for this section', NONE: 'No title' };

function emptyPlacement(section: TeamSection): TeamPlacementInput {
  return { section, departmentId: null, countryOverride: null, region: section === 'FOUNDERS' ? 'Africa' : null, sortOrder: 0, visible: true, titleSource: section === 'FOUNDERS' ? 'SECONDARY' : 'PRIMARY', secondaryTitleSource: 'NONE', customTitle: { en: '' }, customSecondaryTitle: { en: '' }, bio: { en: '' } };
}
function emptyPerson(): TeamPersonInput {
  return { slug: '', fullName: '', country: '', primaryTitle: { en: '' }, secondaryTitle: { en: '' }, profilePath: null, published: false, placements: [], photo: { action: 'KEEP' } };
}
function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function englishTitle(person: TeamPersonInput, placement: TeamPlacementInput, secondary = false) {
  const source = secondary ? placement.secondaryTitleSource : placement.titleSource;
  return source === 'PRIMARY' ? person.primaryTitle.en : source === 'SECONDARY' ? person.secondaryTitle.en : source === 'CUSTOM' ? (secondary ? placement.customSecondaryTitle.en : placement.customTitle.en) : '';
}

export function AdminTeamPersonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState<TeamPersonInput>(emptyPerson);
  const [departments, setDepartments] = useState<AdminTeamDepartment[]>([]);
  const [drafts, setDrafts] = useState<Record<TeamSection, TeamPlacementInput>>(() => ({ LEADERSHIP: emptyPlacement('LEADERSHIP'), FOUNDERS: emptyPlacement('FOUNDERS'), DEPARTMENTS: emptyPlacement('DEPARTMENTS') }));
  const [sections, setSections] = useState<TeamSection[]>([]);
  const [locale, setLocale] = useState<TeamLocale>('en');
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    Promise.all([getAdminTeam(token), id ? getAdminTeamPerson(id, token) : Promise.resolve(null)])
      .then(([snapshot, person]) => {
        if (!active) return;
        setDepartments(snapshot.departments);
        const nextDrafts = { LEADERSHIP: emptyPlacement('LEADERSHIP'), FOUNDERS: emptyPlacement('FOUNDERS'), DEPARTMENTS: emptyPlacement('DEPARTMENTS') };
        TEAM_SECTIONS.forEach(section => {
          const existing = snapshot.people.flatMap(member => member.placements).filter(placement => placement.section === section);
          nextDrafts[section].sortOrder = existing.length ? Math.max(...existing.map(placement => placement.sortOrder)) + 1 : 0;
        });
        nextDrafts.DEPARTMENTS.departmentId = snapshot.departments.find(department => department.visible)?.id ?? snapshot.departments[0]?.id ?? null;
        if (person) {
          setForm({ slug: person.slug, fullName: person.fullName, country: person.country, primaryTitle: person.primaryTitle, secondaryTitle: person.secondaryTitle, profilePath: person.profilePath, published: person.published, version: person.version, placements: person.placements, photo: { action: 'KEEP' } });
          person.placements.forEach(placement => { nextDrafts[placement.section] = placement; });
          setSections(person.placements.map(placement => placement.section));
          setCurrentPhoto(person.photoUrl);
          setSlugTouched(true);
        } else {
          setForm(emptyPerson());
          setSections([]);
          setCurrentPhoto(null);
          setSlugTouched(false);
        }
        setDrafts(nextDrafts);
        setPhotoFile(null);
        setPhotoUrl('');
      })
      .catch(cause => { if (active) setLoadError(cause instanceof ApiError ? cause.message : 'Could not load the Team editor.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, token, loadAttempt]);

  const updateDraft = (section: TeamSection, patch: Partial<TeamPlacementInput>) => setDrafts(previous => ({ ...previous, [section]: { ...previous[section], ...patch } }));
  const updateTitle = (key: 'primaryTitle' | 'secondaryTitle', value: LocalizedText) => setForm(previous => ({ ...previous, [key]: value }));
  const toggleSection = (section: TeamSection) => setSections(previous => previous.includes(section) ? previous.filter(value => value !== section) : [...previous, section]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setError(null);
    const payload: TeamPersonInput = { ...form, fullName: form.fullName.trim(), country: form.country.trim(), profilePath: form.profilePath?.trim() || null, placements: TEAM_SECTIONS.filter(section => sections.includes(section)).map(section => ({ ...drafts[section], countryOverride: drafts[section].countryOverride?.trim() || null })), photo: form.photo.action === 'URL' ? { action: 'URL', url: photoUrl.trim() } : { action: form.photo.action } };
    if (!payload.fullName || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) { setError('Enter a name and a URL key using lowercase letters, numbers, and single hyphens.'); return; }
    if (payload.profilePath && (!payload.profilePath.startsWith('/') || payload.profilePath.startsWith('//'))) { setError('The profile link must be a path on this website, such as /about#olivier-ndatimana.'); return; }
    if (payload.photo.action === 'UPLOAD' && !photoFile) { setError('Choose a photo to upload, or select another photo option.'); return; }
    if (payload.photo.action === 'URL') {
      try {
        const url = new URL(payload.photo.url!);
        if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid URL');
      } catch { setError('Enter a public HTTPS image URL without a username or password.'); return; }
    }
    if (payload.published && (!payload.primaryTitle.en.trim() || (payload.photo.action === 'KEEP' && !currentPhoto))) { setError('A published person needs an English primary title and a photo.'); setLocale('en'); return; }
    for (const placement of payload.placements) {
      if (placement.section === 'DEPARTMENTS' && !placement.departmentId) { setError('Choose a department, or create one in Team → Departments first.'); return; }
      if (payload.published && placement.visible && (!placement.bio.en.trim() || !englishTitle(payload, placement).trim() || (placement.secondaryTitleSource !== 'NONE' && !englishTitle(payload, placement, true).trim()))) {
        setError(`${SECTION_NAMES[placement.section]} needs an English biography and English text for its selected titles before publication.`); setLocale('en'); return;
      }
    }
    setSaving(true);
    try {
      await saveTeamPerson(id ?? null, payload, payload.photo.action === 'UPLOAD' ? photoFile : null, token);
      navigate(TEAM_ADMIN_ROUTES.list, { state: { teamMessage: `${payload.fullName} saved.` } });
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409 ? 'This person or their order changed while you were editing. Your edits are still here. Open the latest record in another tab, compare the changes, then reload this editor before saving again.' : cause instanceof ApiError ? cause.message : 'Could not save this person. Your edits are still here; please try again.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <SEO title={id ? 'Edit Team Person' : 'New Team Person'} url={TEAM_ADMIN_ROUTES.list} noIndex />
      <Link to={TEAM_ADMIN_ROUTES.list} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-purple"><ArrowLeft className="w-4 h-4" />Back to Team</Link>
      {loading ? <p className="text-muted-foreground text-sm" role="status">Loading Team editor…</p> : loadError ? <div className="space-y-3"><TeamNotice error>{loadError}</TeamNotice><button type="button" onClick={() => setLoadAttempt(value => value + 1)} className={teamSecondaryButtonClass}>Try again</button></div> : (
        <form onSubmit={submit} className="space-y-6">
          <div><h2 className="text-xl font-bold">{id ? `Edit ${form.fullName}` : 'Add a person'}</h2><p className="mt-1 text-sm text-muted-foreground">Update shared details once. Choose where this person appears below.</p></div>
          {error && <TeamNotice error>{error}</TeamNotice>}
          <fieldset disabled={saving} className="space-y-6 min-w-0">
            <div className="bg-card border border-border rounded-2xl p-5 md:p-7 space-y-5">
              <h3 className="text-base font-semibold">Shared details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label htmlFor="team-name" className="block text-sm font-medium mb-1.5">Full name *</label><input id="team-name" required maxLength={200} value={form.fullName} onChange={event => { const fullName = event.target.value; setForm(previous => ({ ...previous, fullName, slug: !id && !slugTouched ? slugify(fullName) : previous.slug })); }} className={teamInputClass} /></div>
                <div><label htmlFor="team-country" className="block text-sm font-medium mb-1.5">Default country / location</label><input id="team-country" maxLength={100} value={form.country} onChange={event => setForm(previous => ({ ...previous, country: event.target.value }))} className={teamInputClass} placeholder="Rwanda or Global" /></div>
                <div><label htmlFor="team-slug" className="block text-sm font-medium mb-1.5">URL key *</label><input id="team-slug" required readOnly={!!id} value={form.slug} maxLength={100} onChange={event => { setSlugTouched(true); setForm(previous => ({ ...previous, slug: event.target.value })); }} className={`${teamInputClass} ${id ? 'bg-accent text-muted-foreground' : ''}`} /><p className="mt-1 text-xs text-muted-foreground">{id ? 'This permanent key preserves existing references and cannot change.' : 'Filled from the name. Use lowercase letters, numbers, and hyphens.'}</p></div>
                <div><label htmlFor="team-profile" className="block text-sm font-medium mb-1.5">Profile link on this website</label><input id="team-profile" maxLength={500} value={form.profilePath ?? ''} onChange={event => setForm(previous => ({ ...previous, profilePath: event.target.value || null }))} className={teamInputClass} placeholder="/about#olivier-ndatimana" /><p className="mt-1 text-xs text-muted-foreground">Optional existing page or anchor for the full profile.</p></div>
              </div>
              <TeamLocaleTabs locale={locale} onChange={setLocale} />
              <div className="grid md:grid-cols-2 gap-4">
                <TeamLocalizedField label="Primary title" value={form.primaryTitle} locale={locale} onChange={value => updateTitle('primaryTitle', value)} requiredEnglish={form.published} />
                <TeamLocalizedField label="Secondary title" value={form.secondaryTitle} locale={locale} onChange={value => updateTitle('secondaryTitle', value)} help="For example, the person's founder role." />
              </div>
              <p className="text-xs text-muted-foreground">These names, photos, and titles also update matching profiles on Home and About. Their longer biographies are managed separately.</p>
              <label className="flex items-start gap-3"><input type="checkbox" checked={form.published} onChange={event => setForm(previous => ({ ...previous, published: event.target.checked }))} className="mt-1 accent-brand-purple" /><span><span className="text-sm font-medium">Published</span><span className="block text-xs text-muted-foreground mt-1">Hidden people remain editable and disappear from all public appearances, including matching Home and About profiles.</span></span></label>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 md:p-7"><TeamPhotoField currentUrl={currentPhoto} action={form.photo.action} url={photoUrl} file={photoFile} onActionChange={action => { setForm(previous => ({ ...previous, photo: { action } })); if (action !== 'UPLOAD') setPhotoFile(null); }} onUrlChange={setPhotoUrl} onFileChange={setPhotoFile} /></div>
            <div className="bg-card border border-border rounded-2xl p-5 md:p-7 space-y-5">
              <div><h3 className="text-base font-semibold">Page sections</h3><p className="mt-1 text-sm text-muted-foreground">A person can appear once in each section. Turn off “Show this card” to hide a placement while keeping its text.</p></div>
              <div className="flex flex-wrap gap-4">{TEAM_SECTIONS.map(section => <label key={section} className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={sections.includes(section)} onChange={() => toggleSection(section)} className="accent-brand-purple" />{SECTION_NAMES[section]}</label>)}</div>
              {!sections.length && <p className="text-sm text-muted-foreground">No Team cards selected. Shared Home/About appearances are controlled by the Published setting.</p>}
              {TEAM_SECTIONS.filter(section => sections.includes(section)).map(section => {
                const placement = drafts[section];
                return (
                  <section key={section} aria-labelledby={`placement-${section}`} className="border-t border-border pt-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><h4 id={`placement-${section}`} className="font-semibold">{SECTION_NAMES[section]}</h4><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={placement.visible} onChange={event => updateDraft(section, { visible: event.target.checked })} className="accent-brand-purple" />Show this card</label></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label htmlFor={`${section}-country`} className="block text-sm font-medium mb-1.5">Country / location override</label><input id={`${section}-country`} maxLength={100} value={placement.countryOverride ?? ''} onChange={event => updateDraft(section, { countryOverride: event.target.value || null })} className={teamInputClass} placeholder={form.country || 'Use default location'} /></div>
                      <div><label htmlFor={`${section}-order`} className="block text-sm font-medium mb-1.5">Order</label><input id={`${section}-order`} type="number" min={0} max={1000000} step={1} required value={placement.sortOrder} onChange={event => updateDraft(section, { sortOrder: Number(event.target.value) })} className={teamInputClass} /><p className="mt-1 text-xs text-muted-foreground">Smaller numbers appear first. Team → Ordering offers move up/down controls.</p></div>
                      {section === 'FOUNDERS' && <div><label htmlFor={`${section}-region`} className="block text-sm font-medium mb-1.5">Region</label><select id={`${section}-region`} required value={placement.region ?? 'Africa'} onChange={event => updateDraft(section, { region: event.target.value as TeamPlacementInput['region'] })} className={teamInputClass}>{['Africa', 'Europe', 'Asia', 'USA'].map(region => <option key={region}>{region}</option>)}</select></div>}
                      {section === 'DEPARTMENTS' && <div><label htmlFor={`${section}-department`} className="block text-sm font-medium mb-1.5">Department *</label><select id={`${section}-department`} required value={placement.departmentId ?? ''} onChange={event => updateDraft(section, { departmentId: event.target.value || null })} className={teamInputClass}><option value="">Choose a department</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name[locale] || department.name.en}{department.visible ? '' : ' (hidden)'}</option>)}</select>{!departments.length && <p className="mt-1 text-xs text-muted-foreground">Create a department from Team → Departments first.</p>}</div>}
                      {(['titleSource', 'secondaryTitleSource'] as const).map((sourceKey, index) => <div key={sourceKey}><label htmlFor={`${section}-${sourceKey}`} className="block text-sm font-medium mb-1.5">{index ? 'Additional title source' : 'Card title source'}</label><select id={`${section}-${sourceKey}`} value={placement[sourceKey]} onChange={event => updateDraft(section, { [sourceKey]: event.target.value as TeamTitleSource })} className={teamInputClass}>{(index ? ['NONE', 'PRIMARY', 'SECONDARY', 'CUSTOM'] : ['PRIMARY', 'SECONDARY', 'CUSTOM']).map(source => <option key={source} value={source}>{TITLE_NAMES[source as TeamTitleSource]}</option>)}</select><p className="mt-1 text-xs text-muted-foreground">{placement[sourceKey] === 'CUSTOM' ? 'This title only changes this card.' : placement[sourceKey] === 'NONE' ? 'No additional title displayed.' : `English: ${englishTitle(form, placement, !!index) || 'not entered yet'}`}</p></div>)}
                    </div>
                    {placement.titleSource === 'CUSTOM' && <TeamLocalizedField label="Custom card title" value={placement.customTitle} locale={locale} onChange={value => updateDraft(section, { customTitle: value })} requiredEnglish={form.published && placement.visible} />}
                    {placement.secondaryTitleSource === 'CUSTOM' && <TeamLocalizedField label="Custom additional title" value={placement.customSecondaryTitle} locale={locale} onChange={value => updateDraft(section, { customSecondaryTitle: value })} requiredEnglish={form.published && placement.visible} />}
                    <TeamLocalizedField label="Card biography" value={placement.bio} locale={locale} multiline requiredEnglish={form.published && placement.visible} onChange={value => updateDraft(section, { bio: value })} help="Plain text shown on this section's card." />
                  </section>
                );
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={saving} className={teamButtonClass}>{saving ? 'Saving…' : 'Save person'}</button><Link to={TEAM_ADMIN_ROUTES.list} className={teamSecondaryButtonClass}>Cancel</Link>{id && <a href={teamPersonEditPath(id)} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-brand-purple hover:underline">Open latest record in a new tab</a>}</div>
          {error && <TeamNotice error>{error}</TeamNotice>}
        </form>
      )}
    </div>
  );
}
