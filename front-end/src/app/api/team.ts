import { apiFetch } from './client';
import { TEAM_LOCALES, TEAM_PAGE_FIELDS, TEAM_SECTIONS } from '../types/team';
import type { AdminTeamDepartment, AdminTeamPage, AdminTeamPerson, AdminTeamSnapshot, LocalizedText, PublicTeamPerson, PublicTeamSnapshot, TeamPageCopy, TeamPersonInput, TeamSection } from '../types/team';

function invalid(): never { throw new Error('The Team server returned invalid data. Please reload or try again.'); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function string(value: unknown): void { if (typeof value !== 'string') invalid(); }
function nullableString(value: unknown): void { if (value !== null) string(value); }
function integer(value: unknown): void { if (!Number.isSafeInteger(value) || Number(value) < 0) invalid(); }
function boolean(value: unknown): void { if (typeof value !== 'boolean') invalid(); }
function array(value: unknown): unknown[] { if (!Array.isArray(value)) invalid(); return value; }
function localized(value: unknown): void {
  const text = object(value); string(text.en);
  for (const locale of TEAM_LOCALES) if (text[locale] !== undefined) string(text[locale]);
}
function pageCopy(value: unknown, localizedValues: boolean): void {
  const copy = object(value);
  for (const key of TEAM_PAGE_FIELDS) (localizedValues ? localized : string)(copy[key]);
}
function identity(value: unknown): Record<string, unknown> {
  const person = object(value);
  for (const key of ['id', 'slug', 'fullName', 'country']) string(person[key]);
  nullableString(person.photoUrl); nullableString(person.profilePath);
  return person;
}
function publicPerson(value: unknown): PublicTeamPerson {
  const person = identity(value); string(person.primaryTitle); string(person.secondaryTitle);
  return value as PublicTeamPerson;
}
function publicSnapshot(value: unknown): PublicTeamSnapshot {
  const snapshot = object(value);
  if (!TEAM_LOCALES.includes(snapshot.locale as typeof TEAM_LOCALES[number])) invalid();
  pageCopy(snapshot.page, false);
  for (const item of array(snapshot.departments)) {
    const dep = object(item); for (const key of ['id', 'key', 'name']) string(dep[key]); integer(dep.sortOrder);
  }
  const sections = object(snapshot.sections);
  for (const section of TEAM_SECTIONS) for (const item of array(sections[section])) {
    const placement = identity(item);
    for (const key of ['personId', 'title', 'secondaryTitle', 'bio']) string(placement[key]);
    for (const key of ['region', 'departmentId', 'departmentName']) nullableString(placement[key]);
    integer(placement.sortOrder);
  }
  return value as PublicTeamSnapshot;
}
function adminPerson(value: unknown): AdminTeamPerson {
  const person = identity(value);
  localized(person.primaryTitle); localized(person.secondaryTitle); integer(person.version); boolean(person.published);
  if (![null, 'CLOUDINARY_UPLOAD', 'EXTERNAL_URL'].includes(person.photoSource as string | null)) invalid();
  for (const item of array(person.placements)) {
    const p = object(item); string(p.id);
    if (!TEAM_SECTIONS.includes(p.section as TeamSection)) invalid();
    for (const key of ['departmentId', 'countryOverride', 'region']) nullableString(p[key]);
    for (const key of ['titleSource', 'secondaryTitleSource']) if (!['PRIMARY', 'SECONDARY', 'CUSTOM', 'NONE'].includes(p[key] as string)) invalid();
    for (const key of ['customTitle', 'customSecondaryTitle', 'bio']) localized(p[key]);
    integer(p.sortOrder); boolean(p.visible);
  }
  return value as AdminTeamPerson;
}
function department(value: unknown): AdminTeamDepartment {
  const dep = object(value); string(dep.id); string(dep.key); localized(dep.name);
  integer(dep.version); integer(dep.sortOrder); boolean(dep.visible);
  return value as AdminTeamDepartment;
}
function adminPage(value: unknown): AdminTeamPage {
  const page = object(value); pageCopy(page.copy, true); integer(page.version);
  return value as AdminTeamPage;
}
function adminSnapshot(value: unknown): AdminTeamSnapshot {
  const snapshot = object(value); integer(snapshot.directoryVersion);
  array(snapshot.people).forEach(adminPerson); array(snapshot.departments).forEach(department); adminPage(snapshot.page);
  return value as AdminTeamSnapshot;
}
function unwrap<T>(payload: unknown, validate: (value: unknown) => T): T {
  return validate(object(payload).data);
}
export async function getTeam(locale: string): Promise<PublicTeamSnapshot> {
  return unwrap(await apiFetch<unknown>(`/team?locale=${encodeURIComponent(locale)}`), publicSnapshot);
}
export async function getTeamPerson(slug: string, locale: string): Promise<PublicTeamPerson> {
  return unwrap(await apiFetch<unknown>(`/team/people/slug/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`), publicPerson);
}
export async function getAdminTeam(token: string): Promise<AdminTeamSnapshot> {
  return unwrap(await apiFetch<unknown>('/admin/team', { token }), adminSnapshot);
}
export async function getAdminTeamPerson(id: string, token: string): Promise<AdminTeamPerson> {
  return unwrap(await apiFetch<unknown>(`/admin/team/people/${encodeURIComponent(id)}`, { token }), adminPerson);
}
export async function saveTeamPerson(id: string | null, input: TeamPersonInput, photo: File | null, token: string): Promise<AdminTeamPerson> {
  const body = new FormData(); body.append('payload', JSON.stringify(input));
  if (photo) body.append('photo', photo);
  return unwrap(await apiFetch<unknown>(`/admin/team/people${id ? `/${encodeURIComponent(id)}` : ''}`, { method: id ? 'PUT' : 'POST', body, token }), adminPerson);
}
export interface TeamDepartmentInput { key: string; name: LocalizedText; sortOrder: number; visible: boolean; version?: number; }
export async function saveTeamDepartment(id: string | null, input: TeamDepartmentInput, token: string): Promise<AdminTeamDepartment> {
  return unwrap(await apiFetch<unknown>(`/admin/team/departments${id ? `/${encodeURIComponent(id)}` : ''}`, { method: id ? 'PUT' : 'POST', body: input, token }), department);
}
export async function reorderTeamSection(section: TeamSection, ids: string[], directoryVersion: number, token: string): Promise<AdminTeamSnapshot> {
  return unwrap(await apiFetch<unknown>(`/admin/team/sections/${section}/order`, { method: 'PUT', body: { ids, directoryVersion }, token }), adminSnapshot);
}
export async function reorderTeamDepartments(ids: string[], directoryVersion: number, token: string): Promise<AdminTeamSnapshot> {
  return unwrap(await apiFetch<unknown>('/admin/team/departments/order', { method: 'PUT', body: { ids, directoryVersion }, token }), adminSnapshot);
}
export async function saveTeamPage(copy: TeamPageCopy, version: number, token: string): Promise<AdminTeamPage> {
  return unwrap(await apiFetch<unknown>('/admin/team/page', { method: 'PUT', body: { copy, version }, token }), adminPage);
}
