import 'dotenv/config';
import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { importTeam } from '../prisma/seeds/team';
import type { AdminTeamPerson, TeamPlacementInput } from '../src/team/types';

const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid');
if (!['localhost', '127.0.0.1'].includes(database.hostname) || !database.pathname.includes('gcv_team_test')) throw new Error('Team integration tests require the isolated local gcv_team_test database');
const base = process.env.TEAM_TEST_API_URL || 'http://127.0.0.1:4301/api';
if (!base.startsWith('http://127.0.0.1:')) throw new Error('Only local test API is allowed');
const db = new PrismaClient();
let token = '';
let memberToken = '';
let merchantToken = '';
async function request(path: string, options: RequestInit = {}, auth?: string) {
  const response = await fetch(base + path, { ...options, headers: { ...(auth ? { Authorization: auth } : {}), ...options.headers } });
  const body = await response.json();
  return { response, body };
}
async function json(path: string, method: string, body: unknown, auth = token) {
  return request(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, auth);
}
function editInput(person: AdminTeamPerson) {
  const { id, photoUrl, photoSource, ...input } = person;
  return { ...input, photo: { action: 'KEEP' as const } };
}
async function save(id: string | null, payload: unknown, auth = token, photo?: Blob) {
  const body = new FormData(); body.append('payload', JSON.stringify(payload));
  if (photo) body.append('photo', photo, 'photo.png');
  return request(`/admin/team/people${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body }, auth);
}
before(async () => {
  for (const [email, role] of [['team-admin@example.invalid', 'ADMIN'], ['team-member@example.invalid', 'MEMBER'], ['team-merchant@example.invalid', 'MERCHANT']] as const) {
    await db.user.upsert({ where: { email }, update: {}, create: { email, firstName: 'Team', lastName: 'Test', password: hashSync('Team-local-test-123!', 4), roles: { create: { role } } } });
    const { response, body } = await json('/auth/signin', 'POST', { email, password: 'Team-local-test-123!' }, '');
    assert.equal(response.status, 200);
    const value = body.data?.token ?? body.token;
    assert.equal(typeof value, 'string', 'Signin must return a token');
    if (role === 'ADMIN') token = value; else if (role === 'MEMBER') memberToken = value; else merchantToken = value;
  }
});
after(async () => { await db.$disconnect(); });

test('dry-run never writes or uploads; import preserves all identities and edits on rerun', async () => {
  let uploads = 0;
  const resolveMedia = async (person: { slug: string }) => { uploads++; return { photoUrl: `https://res.cloudinary.com/team-test/image/upload/${person.slug}.jpeg`, cloudinaryPublicId: `KHM/team/import-v1/${person.slug}`, cloudinaryAssetId: `test-${person.slug}` }; };
  const dry = await importTeam({ prisma: db, resolveMedia });
  assert.equal(dry.mode, 'dry-run'); assert.equal(uploads, 0);
  assert.equal(dry.people, 14); assert.equal(dry.placements, 16); assert.equal(dry.departments, 6);
  await importTeam({ apply: true, prisma: db, resolveMedia });
  assert.equal(await db.teamPerson.count(), 14); assert.equal(await db.teamPlacement.count(), 16);
  assert.equal(await db.teamDepartment.count(), 6);
  const before = await db.teamPerson.findUniqueOrThrow({ where: { slug: 'doris-yin' } });
  await db.teamPerson.update({ where: { id: before.id }, data: { fullName: 'Doris import rerun test', version: { increment: 1 } } });
  const uploadCount = uploads;
  await importTeam({ apply: true, prisma: db, resolveMedia });
  assert.equal(uploads, uploadCount);
  assert.equal((await db.teamPerson.findUniqueOrThrow({ where: { id: before.id } })).fullName, 'Doris import rerun test');
  await db.teamPerson.update({ where: { id: before.id }, data: { fullName: before.fullName } });
});

test('public snapshot preserves order, role links, translations, and private media identifiers', async () => {
  for (const locale of ['en', 'fr', 'rw', 'sw']) {
    const { response, body } = await request(`/team?locale=${locale}`);
    assert.equal(response.status, 200); const data = body.data;
    assert.equal(data.sections.LEADERSHIP.length, 2); assert.equal(data.sections.FOUNDERS.length, 8); assert.equal(data.sections.DEPARTMENTS.length, 6);
    assert.deepEqual(data.sections.LEADERSHIP.map((p: { slug: string }) => p.slug), ['doris-yin', 'olivier-ndatimana']);
    assert.equal(data.sections.FOUNDERS[0].slug, 'doris-yin'); assert.equal(data.departments.length, 6);
    assert.equal(data.sections.LEADERSHIP[0].country, 'Global'); assert.equal(data.sections.FOUNDERS[0].country, 'China');
    assert.ok(!JSON.stringify(data).includes('cloudinaryPublicId'));
    const profile = await request(`/team/people/slug/doris-yin?locale=${locale}`);
    assert.equal(data.sections.LEADERSHIP[0].title, profile.body.data.primaryTitle);
    assert.equal(data.sections.FOUNDERS[0].title, profile.body.data.secondaryTitle);
  }
});

test('all admin reads and mutation/upload routes reject anonymous and non-admin users', async () => {
  for (const auth of [undefined, memberToken, merchantToken]) {
    const expected = auth ? 403 : 401;
    assert.equal((await request('/admin/team', {}, auth)).response.status, expected);
    const form = new FormData(); form.append('payload', 'invalid-json'); form.append('photo', new Blob(['not an image']), 'bad.png');
    assert.equal((await request('/admin/team/people', { method: 'POST', body: form }, auth)).response.status, expected);
    assert.equal((await json('/admin/team/page', 'PUT', {}, auth || '')).response.status, expected);
    assert.equal((await json('/admin/team/departments', 'POST', {}, auth || '')).response.status, expected);
    assert.equal((await json('/admin/team/sections/LEADERSHIP/order', 'PUT', {}, auth || '')).response.status, expected);
  }
});

test('edits share canonical fields; version conflicts and invalid photos preserve published data', async () => {
  const snapshot = (await request('/admin/team', {}, token)).body.data;
  const doris = snapshot.people.find((p: { slug: string }) => p.slug === 'doris-yin');
  const input = editInput(doris);
  input.fullName = 'Doris editor test';
  input.primaryTitle = { ...input.primaryTitle, en: 'Edited current title' };
  input.secondaryTitle = { ...input.secondaryTitle, en: 'Edited founder title' };
  const changed = await save(doris.id, input); assert.equal(changed.response.status, 200);
  const page = (await request('/team?locale=en')).body.data;
  assert.equal(page.sections.LEADERSHIP[0].fullName, input.fullName);
  assert.equal(page.sections.LEADERSHIP[0].title, input.primaryTitle.en);
  assert.equal(page.sections.FOUNDERS[0].title, input.secondaryTitle.en);
  assert.equal((await save(doris.id, input)).response.status, 409);
  const latest = changed.body.data;
  assert.equal(latest.primaryTitle.fr, doris.primaryTitle.fr);
  for (const url of ['javascript:alert(1)', 'http://example.com/a.png', 'https://127.0.0.1/a.png']) {
    const invalid = { ...editInput(latest), photo: { action: 'URL', url } };
    assert.equal((await save(doris.id, invalid)).response.status, 400);
  }
  const invalidImage = await save(doris.id, { ...editInput(latest), photo: { action: 'UPLOAD' } }, token, new Blob(['not a png'], { type: 'image/png' }));
  assert.ok([400, 415].includes(invalidImage.response.status));
  assert.equal((await request(`/admin/team/people/${doris.id}`, {}, token)).body.data.photoUrl, doris.photoUrl);
  const restore = editInput(doris); restore.version = latest.version;
  assert.equal((await save(doris.id, restore)).response.status, 200);
});

test('reorder is transactional; stale revisions fail; hide affects public profiles and all placements', async () => {
  let state = (await request('/admin/team', {}, token)).body.data;
  const ids = state.people.flatMap((p: AdminTeamPerson) => p.placements).filter((p: TeamPlacementInput & { id: string }) => p.section === 'LEADERSHIP').sort((a: TeamPlacementInput, b: TeamPlacementInput) => a.sortOrder - b.sortOrder).map((p: TeamPlacementInput & { id: string }) => p.id);
  const moved = await json('/admin/team/sections/LEADERSHIP/order', 'PUT', { ids: [...ids].reverse(), directoryVersion: state.directoryVersion });
  assert.equal(moved.response.status, 200);
  assert.equal((await request('/team')).body.data.sections.LEADERSHIP[0].slug, 'olivier-ndatimana');
  assert.equal((await json('/admin/team/sections/LEADERSHIP/order', 'PUT', { ids, directoryVersion: state.directoryVersion })).response.status, 409);
  state = moved.body.data;
  assert.equal((await json('/admin/team/sections/LEADERSHIP/order', 'PUT', { ids, directoryVersion: state.directoryVersion })).response.status, 200);
  state = (await request('/admin/team', {}, token)).body.data;
  const person = state.people.find((p: AdminTeamPerson) => p.slug === 'doris-yin');
  const hidden = await save(person.id, { ...editInput(person), published: false }); assert.equal(hidden.response.status, 200);
  assert.equal((await request('/team/people/slug/doris-yin')).response.status, 404);
  assert.ok(!(await request('/team')).body.data.sections.FOUNDERS.some((p: AdminTeamPerson) => p.slug === 'doris-yin'));
  assert.equal((await save(person.id, { ...editInput(hidden.body.data), published: true })).response.status, 200);
});
