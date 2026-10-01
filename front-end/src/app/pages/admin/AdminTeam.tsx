import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { TEAM_ADMIN_ROUTES, teamPersonEditPath } from '../../lib/teamRoutes';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, RefreshCw } from 'lucide-react';
import { getAdminTeam, reorderTeamDepartments, reorderTeamSection, saveTeamDepartment, saveTeamPage, type TeamDepartmentInput } from '../../api/team';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/SEO';
import { TEAM_PAGE_FIELDS, TEAM_SECTIONS, type AdminTeamDepartment, type AdminTeamPage, type AdminTeamPerson, type AdminTeamSnapshot, type TeamLocale, type TeamPageCopy, type TeamPageField, type TeamSection } from '../../types/team';
import { TeamLocaleTabs, TeamLocalizedField, TeamNotice, teamButtonClass, teamInputClass, teamSecondaryButtonClass } from '../../components/admin/TeamEditorFields';

const SECTION_NAMES: Record<TeamSection, string> = { LEADERSHIP: 'Global Leadership', FOUNDERS: 'Founders', DEPARTMENTS: 'Department Teams' };
const PAGE_LABELS: Record<TeamPageField, string> = {
  heroBadge: 'Hero badge', heroTitle: 'Hero heading', heroSubtitle: 'Hero introduction', leadershipEyebrow: 'Leadership small heading', leadershipTitle: 'Leadership heading', foundersEyebrow: 'Founders small heading', foundersTitle: 'Founders heading', departmentsEyebrow: 'Departments small heading', departmentsTitle: 'Departments heading', seoTitle: 'Search result title', seoDescription: 'Search result description',
};
const TABS = [{ key: 'people', label: 'People' }, { key: 'ordering', label: 'Ordering' }, { key: 'departments', label: 'Departments' }, { key: 'page', label: 'Page wording' }] as const;
function sortByOrder<T extends { id: string; sortOrder: number }>(items: T[]): T[] { return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)); }
function friendlyError(cause: unknown, fallback: string): string {
  return cause instanceof ApiError && cause.status === 409 ? 'This content changed while you were editing. Your form entries are still here. Check the latest record in another tab, then reload before saving again.' : cause instanceof Error ? cause.message : fallback;
}
function StatusBadge({ visible, children }: { visible: boolean; children?: React.ReactNode }) {
  return <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${visible ? 'bg-brand-green/10 text-foreground' : 'bg-accent text-muted-foreground'}`}>{children ?? (visible ? 'Published' : 'Hidden')}</span>;
}
function PersonPhoto({ person }: { person: AdminTeamPerson }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [person.photoUrl]);
  return <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 overflow-hidden">{person.photoUrl && !failed ? <img src={person.photoUrl} alt="" className="w-full h-full object-cover" onError={() => setFailed(true)} /> : <span className="text-xs font-semibold text-muted-foreground" aria-label="No photo">{person.fullName.split(' ').map(word => word[0]).join('').slice(0, 2)}</span>}</div>;
}

function DepartmentEditor({ departments, token, onSaved, disabled, onSavingChange }: { departments: AdminTeamDepartment[]; token: string; onSaved: (message: string) => Promise<void>; disabled: boolean; onSavingChange: (saving: boolean) => void }) {
  const emptyForm = (): TeamDepartmentInput => ({ key: '', name: { en: '' }, sortOrder: departments.length ? Math.max(...departments.map(item => item.sortOrder)) + 1 : 0, visible: true });
  const departmentForm = (department: AdminTeamDepartment): TeamDepartmentInput => ({ key: department.key, name: department.name, sortOrder: department.sortOrder, visible: department.visible, version: department.version });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeamDepartmentInput>(emptyForm);
  const [savedForm, setSavedForm] = useState(form);
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const [locale, setLocale] = useState<TeamLocale>('en');
  const [keyTouched, setKeyTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const reset = () => { const next = emptyForm(); setEditingId(null); setForm(next); setSavedForm(next); setKeyTouched(false); setError(null); };
  const edit = (department: AdminTeamDepartment) => { const next = departmentForm(department); setEditingId(department.id); setForm(next); setSavedForm(next); setKeyTouched(true); setError(null); };
  useEffect(() => {
    // A refreshed directory may change versions/order. Adopt it only when no draft would be lost.
    if (dirty) return;
    const department = departments.find(item => item.id === editingId);
    const next = department ? departmentForm(department) : emptyForm();
    setForm(next); setSavedForm(next);
  }, [departments, editingId, dirty]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || saving) return;
    if (!form.name.en.trim()) { setError('Enter an English department name.'); setLocale('en'); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.key)) { setError('Use lowercase letters, numbers, and single hyphens for the department key.'); return; }
    setError(null); setSaving(true); onSavingChange(true);
    try { const result = await saveTeamDepartment(editingId, form, token); reset(); await onSaved(`${result.name.en} saved.`); }
    catch (cause) { setError(friendlyError(cause, 'Could not save this department.')); }
    finally { setSaving(false); onSavingChange(false); }
  };
  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      <div className="space-y-3">
        <h3 className="font-semibold">Departments</h3>
        <p className="text-sm text-muted-foreground">Hiding a department hides its label and its cards. People and their text stay available in the editor.</p>
        {sortByOrder(departments).map(department => <div key={department.id} className="flex items-center justify-between gap-3 p-4 bg-card rounded-2xl border border-border"><div className="min-w-0"><p className="text-sm font-semibold break-words">{department.name.en}</p><p className="mt-1 text-xs text-muted-foreground">Order {department.sortOrder} · {department.visible ? 'Visible' : 'Hidden'}</p></div><button type="button" disabled={disabled || saving} onClick={() => edit(department)} className={teamSecondaryButtonClass} aria-label={`Edit ${department.name.en}`}><Pencil className="w-4 h-4" /><span>Edit</span></button></div>)}
        {!departments.length && <p className="text-sm text-muted-foreground">No departments yet. Add the first one using this form.</p>}
      </div>
      <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-5 space-y-4 self-start">
        <h3 className="font-semibold">{editingId ? 'Edit department' : 'Add department'}</h3>
        {error && <TeamNotice error>{error}</TeamNotice>}
        <fieldset disabled={disabled || saving} className="space-y-4 min-w-0">
          <TeamLocaleTabs locale={locale} onChange={setLocale} />
          <TeamLocalizedField label="Department name" value={form.name} locale={locale} requiredEnglish onChange={name => setForm(previous => ({ ...previous, name, key: !editingId && !keyTouched ? name.en.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : previous.key }))} />
          <div><label htmlFor="department-key" className="block text-sm font-medium mb-1.5">Permanent key *</label><input id="department-key" required readOnly={!!editingId} maxLength={100} value={form.key} onChange={event => { setKeyTouched(true); setForm(previous => ({ ...previous, key: event.target.value })); }} className={teamInputClass} /><p className="mt-1 text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens. This key cannot change after creation.</p></div>
          <div><label htmlFor="department-order" className="block text-sm font-medium mb-1.5">Order</label><input id="department-order" type="number" required min={0} max={1000000} step={1} value={form.sortOrder} onChange={event => setForm(previous => ({ ...previous, sortOrder: Number(event.target.value) }))} className={teamInputClass} /></div>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={event => setForm(previous => ({ ...previous, visible: event.target.checked }))} className="accent-brand-purple" />Visible on the Team page</label>
          <div className="flex flex-wrap gap-3"><button type="submit" className={teamButtonClass}>{saving ? 'Saving…' : editingId ? 'Save department' : 'Add department'}</button>{editingId && <button type="button" onClick={reset} className={teamSecondaryButtonClass}>Cancel edit</button>}</div>
        </fieldset>
      </form>
    </div>
  );
}

function PageEditor({ page, token, onSaved, disabled, onSavingChange }: { page: AdminTeamPage; token: string; onSaved: (message: string) => Promise<void>; disabled: boolean; onSavingChange: (saving: boolean) => void }) {
  const [copy, setCopy] = useState<TeamPageCopy>(page.copy);
  const [version, setVersion] = useState(page.version);
  const [savedCopy, setSavedCopy] = useState(page.copy);
  const dirty = JSON.stringify(copy) !== JSON.stringify(savedCopy);
  const [locale, setLocale] = useState<TeamLocale>('en');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    // Reconcile new snapshots only; a successful save may return before the list refresh does.
    if (!dirty) { setCopy(page.copy); setSavedCopy(page.copy); setVersion(page.version); }
  }, [page]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || saving) return;
    const missing = TEAM_PAGE_FIELDS.find(key => !copy[key].en.trim());
    if (missing) { setError(`Enter English text for ${PAGE_LABELS[missing].toLowerCase()}.`); setLocale('en'); return; }
    setError(null); setSaving(true); onSavingChange(true);
    try { const saved = await saveTeamPage(copy, version, token); setCopy(saved.copy); setSavedCopy(saved.copy); setVersion(saved.version); await onSaved('Team page wording saved.'); }
    catch (cause) { setError(friendlyError(cause, 'Could not save the page wording.')); }
    finally { setSaving(false); onSavingChange(false); }
  };
  return (
    <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-5 md:p-7 space-y-5">
      <div><h3 className="font-semibold">Page wording</h3><p className="mt-1 text-sm text-muted-foreground">Edit the Team hero, section headings, and search result text. People and their biographies are managed separately.</p></div>
      {error && <TeamNotice error>{error}</TeamNotice>}
      <fieldset disabled={disabled || saving} className="space-y-5 min-w-0">
        <TeamLocaleTabs locale={locale} onChange={setLocale} />
        <div className="grid md:grid-cols-2 gap-5">{TEAM_PAGE_FIELDS.map(key => <div key={key} className={key === 'heroSubtitle' || key === 'seoDescription' ? 'md:col-span-2' : ''}><TeamLocalizedField label={PAGE_LABELS[key]} value={copy[key]} locale={locale} requiredEnglish maxLength={8000} multiline={key === 'heroSubtitle' || key === 'seoDescription'} onChange={value => setCopy(previous => ({ ...previous, [key]: value }))} /></div>)}</div>
        <div className="flex flex-wrap gap-3"><button type="submit" className={teamButtonClass}>{saving ? 'Saving…' : 'Save page wording'}</button>{dirty && <button type="button" className={teamSecondaryButtonClass} onClick={() => { setCopy(page.copy); setSavedCopy(page.copy); setVersion(page.version); setError(null); }}>Discard page wording edits</button>}</div>
      </fieldset>
    </form>
  );
}

export function AdminTeam() {
  const { token } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some(tab => tab.key === searchParams.get('tab')) ? searchParams.get('tab')! : 'people';
  const [snapshot, setSnapshot] = useState<AdminTeamSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>((location.state as { teamMessage?: string } | null)?.teamMessage ?? null);
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<TeamSection | ''>('');
  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true); setError(null);
    getAdminTeam(token).then(result => { if (active) setSnapshot(result); }).catch(cause => { if (active) setError(friendlyError(cause, 'Could not load Team content.')); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, attempt]);
  const afterSave = async (success: string) => {
    setMessage(success); setError(null);
    if (!token) return;
    try { setSnapshot(await getAdminTeam(token)); }
    catch { setError('Your changes were saved, but the refreshed list could not be loaded. Refresh the page before making another change.'); }
  };
  const move = async (section: TeamSection | 'DEPARTMENT_ORDER', ids: string[], index: number, direction: -1 | 1) => {
    if (!token || !snapshot || busy) return;
    const destination = index + direction;
    if (destination < 0 || destination >= ids.length) return;
    const next = [...ids];
    [next[index], next[destination]] = [next[destination], next[index]];
    setBusy(true); setError(null); setMessage(null);
    try {
      const result = section === 'DEPARTMENT_ORDER' ? await reorderTeamDepartments(next, snapshot.directoryVersion, token) : await reorderTeamSection(section, next, snapshot.directoryVersion, token);
      setSnapshot(result); setMessage(`${section === 'DEPARTMENT_ORDER' ? 'Department' : SECTION_NAMES[section]} order saved.`);
    } catch (cause) { setError(cause instanceof ApiError && cause.status === 409 ? 'The directory changed before this order could be saved. Refresh the page to load the latest order, then try again.' : friendlyError(cause, 'Could not save this order.')); }
    finally { setBusy(false); }
  };
  const moveButtons = (label: string, section: TeamSection | 'DEPARTMENT_ORDER', ids: string[], index: number) => <div className="flex gap-1 flex-shrink-0"><button type="button" disabled={busy || loading || index === 0} onClick={() => move(section, ids, index, -1)} className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed" aria-label={`Move ${label} up`}><ArrowUp className="w-4 h-4" /></button><button type="button" disabled={busy || loading || index === ids.length - 1} onClick={() => move(section, ids, index, 1)} className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed" aria-label={`Move ${label} down`}><ArrowDown className="w-4 h-4" /></button></div>;
  const people = snapshot?.people.filter(person => (!sectionFilter || person.placements.some(placement => placement.section === sectionFilter)) && `${person.fullName} ${person.country} ${person.primaryTitle.en}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())) ?? [];

  return (
    <div className="space-y-5">
      <SEO title="Manage Team" url={TEAM_ADMIN_ROUTES.list} noIndex />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Team</h2><p className="mt-1 text-sm text-muted-foreground">Manage people, photos, section placements, and public page wording.</p></div><div className="flex flex-wrap gap-2"><Link to="/team" target="_blank" rel="noreferrer" className={teamSecondaryButtonClass}><ExternalLink className="w-4 h-4" />View page</Link><Link to={TEAM_ADMIN_ROUTES.newPerson} className={teamButtonClass}><Plus className="w-4 h-4" />Add person</Link></div></div>
      <div className="flex flex-wrap gap-2 border-b border-border pb-4" role="group" aria-label="Team management views">{TABS.map(tab => <button type="button" key={tab.key} aria-pressed={activeTab === tab.key} onClick={() => setSearchParams(tab.key === 'people' ? {} : { tab: tab.key })} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === tab.key ? 'bg-brand-purple/10 text-brand-purple' : 'text-muted-foreground hover:bg-accent'}`}>{tab.label}</button>)}</div>
      {message && <TeamNotice>{message}</TeamNotice>}
      {error && <div className="space-y-3"><TeamNotice error>{error}</TeamNotice><button type="button" disabled={busy || loading} className={teamSecondaryButtonClass} onClick={() => setAttempt(value => value + 1)}><RefreshCw className="w-4 h-4" />Refresh Team</button></div>}
      {loading && <p className="text-sm text-muted-foreground" role="status">{snapshot ? 'Refreshing Team content…' : 'Loading Team content…'}</p>}
      {snapshot && token ? (
        <>
          <div hidden={activeTab !== 'people'} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3"><div><label htmlFor="team-search" className="block text-sm font-medium mb-1.5">Search people</label><input id="team-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, country, or title" className={teamInputClass} /></div><div><label htmlFor="team-section" className="block text-sm font-medium mb-1.5">Section</label><select id="team-section" value={sectionFilter} onChange={event => setSectionFilter(event.target.value as TeamSection | '')} className={teamInputClass}><option value="">All sections</option>{TEAM_SECTIONS.map(section => <option key={section} value={section}>{SECTION_NAMES[section]}</option>)}</select></div></div>
            <p className="text-xs text-muted-foreground">{people.length} {people.length === 1 ? 'person' : 'people'} · Edit a person to change their visibility, photo, or section assignments.</p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">{people.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b border-border text-xs text-muted-foreground"><th className="px-4 py-3 font-medium">Person</th><th className="px-4 py-3 font-medium">Sections</th><th className="px-4 py-3 font-medium">Visibility</th><th className="px-4 py-3 font-medium"><span className="sr-only">Edit person</span></th></tr></thead><tbody>{people.map(person => <tr key={person.id} className="border-b border-border last:border-0"><td className="px-4 py-4"><div className="flex items-center gap-3"><PersonPhoto person={person} /><div className="min-w-[150px]"><Link className="font-semibold hover:text-brand-purple" to={teamPersonEditPath(person.id)}>{person.fullName}</Link><p className="text-xs text-muted-foreground mt-1">{person.country}</p></div></div></td><td className="px-4 py-4"><div className="flex flex-wrap gap-1.5 min-w-[160px]">{person.placements.length ? person.placements.map(placement => <span key={placement.id} className="text-xs bg-accent px-2 py-1 rounded-lg">{SECTION_NAMES[placement.section]}{!placement.visible ? ' (hidden)' : ''}</span>) : <span className="text-xs text-muted-foreground">No Team cards</span>}</div></td><td className="px-4 py-4"><StatusBadge visible={person.published} /></td><td className="px-4 py-4"><Link to={teamPersonEditPath(person.id)} className="inline-flex p-2 rounded-lg hover:bg-accent" aria-label={`Edit ${person.fullName}`}><Pencil className="w-4 h-4" /></Link></td></tr>)}</tbody></table></div> : <p className="p-8 text-sm text-muted-foreground text-center">{snapshot.people.length ? 'No people match these filters.' : 'No people yet. Add the first person to begin.'}</p>}</div>
          </div>
          <div hidden={activeTab !== 'ordering'} className="space-y-5">
            <p className="text-sm text-muted-foreground">Move a card up or down to save its position immediately. Hidden cards remain in the order so restoring one keeps its place.</p>
            {TEAM_SECTIONS.map(section => {
              const entries = sortByOrder(snapshot.people.flatMap(person => person.placements.filter(placement => placement.section === section).map(placement => ({ ...placement, person }))));
              const ids = entries.map(entry => entry.id);
              return <section key={section} aria-labelledby={`order-${section}`} className="bg-card rounded-2xl border border-border p-5"><h3 id={`order-${section}`} className="font-semibold mb-4">{SECTION_NAMES[section]}</h3>{entries.length ? <ol className="space-y-2">{entries.map((entry, index) => { const department = snapshot.departments.find(item => item.id === entry.departmentId); const shown = entry.visible && entry.person.published && (section !== 'DEPARTMENTS' || !!department?.visible); return <li key={entry.id} className="flex items-center justify-between gap-3 border border-border rounded-xl p-3"><div className="min-w-0"><p className="text-sm font-medium break-words"><span className="text-muted-foreground mr-2">{index + 1}.</span>{entry.person.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{department ? `${department.name.en} · ` : ''}{shown ? 'Visible' : 'Hidden'}</p></div>{moveButtons(`${entry.person.fullName} in ${SECTION_NAMES[section]}`, section, ids, index)}</li>; })}</ol> : <p className="text-sm text-muted-foreground">No cards in this section.</p>}</section>;
            })}
            <section className="bg-card rounded-2xl border border-border p-5"><h3 className="font-semibold mb-4">Department labels</h3><ol className="space-y-2">{sortByOrder(snapshot.departments).map((department, index, list) => <li key={department.id} className="flex items-center justify-between gap-3 border border-border rounded-xl p-3"><div><p className="text-sm font-medium">{index + 1}. {department.name.en}</p><p className="text-xs text-muted-foreground mt-1">{department.visible ? 'Visible' : 'Hidden'}</p></div>{moveButtons(`${department.name.en} department`, 'DEPARTMENT_ORDER', list.map(item => item.id), index)}</li>)}</ol>{!snapshot.departments.length && <p className="text-sm text-muted-foreground">No departments yet.</p>}</section>
          </div>
          <div hidden={activeTab !== 'departments'}><DepartmentEditor departments={snapshot.departments} token={token} onSaved={afterSave} disabled={busy || loading} onSavingChange={setBusy} /></div>
          <div hidden={activeTab !== 'page'}><PageEditor page={snapshot.page} token={token} onSaved={afterSave} disabled={busy || loading} onSavingChange={setBusy} /></div>
        </>
      ) : null}
    </div>
  );
}
