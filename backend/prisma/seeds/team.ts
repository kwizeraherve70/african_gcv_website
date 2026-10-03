/** Dedicated Team import. Default is a read-only dry-run; never invokes general seeds. */
import 'dotenv/config';
import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { appEnv } from '../../src/config/env';
import { departmentInputSchema, pageCopySchema, personInputSchema, imageUrlSchema } from '../../src/team/validation';
import type { TeamPersonInput, TeamPlacementInput } from '../../src/team/types';

const root = path.resolve(__dirname, '../../..');
const manifestFile = path.join(__dirname, 'team-content.json');
interface ImportPlacement extends Omit<TeamPlacementInput, 'id' | 'departmentId'> { departmentKey: string | null; }
interface ImportPerson extends Omit<TeamPersonInput, 'version' | 'photo' | 'placements'> {
  placements: ImportPlacement[];
  localPhoto?: 'doris.jpeg' | 'olivie.jpeg';
  photoUrl?: string;
}
interface MediaReference { photoUrl: string; cloudinaryPublicId: string; cloudinaryAssetId: string; }
interface ImportOptions {
  apply?: boolean;
  prisma?: PrismaClient;
  /** Dependency injection for isolated tests; CLI always uses real Cloudinary. */
  resolveMedia?: (person: ImportPerson) => Promise<MediaReference>;
  mediaCachePath?: string;
}
const mediaReferenceSchema = z.object({ photoUrl: imageUrlSchema, cloudinaryPublicId: z.string().startsWith('KHM/team/'), cloudinaryAssetId: z.string().min(1) }).strict();
const cacheSchema = z.record(mediaReferenceSchema);

async function loadManifest() {
  const raw: unknown = JSON.parse(await readFile(manifestFile, 'utf8'));
  const base = z.object({ schemaVersion: z.literal(1), departments: z.array(departmentInputSchema), page: z.object({ copy: pageCopySchema }).strict(), people: z.array(z.unknown()) }).strict().parse(raw);
  const keys = new Set(base.departments.map(department => department.key));
  if (keys.size !== base.departments.length) throw new Error('Duplicate department key');
  const people: ImportPerson[] = base.people.map(value => {
    const entry = z.object({ localPhoto: z.enum(['doris.jpeg', 'olivie.jpeg']).optional(), photoUrl: imageUrlSchema.optional(), placements: z.array(z.object({ departmentKey: z.string().nullable() }).passthrough()) }).passthrough().parse(value);
    if (Boolean(entry.localPhoto) === Boolean(entry.photoUrl)) throw new Error('Each imported person needs exactly one image source');
    const { localPhoto, photoUrl, placements, ...person } = entry;
    const resolved = placements.map(placement => {
      const { departmentKey, ...data } = placement;
      if (departmentKey && !keys.has(departmentKey)) throw new Error('Unknown import department');
      return { ...data, departmentId: departmentKey ? randomUUID() : null };
    });
    personInputSchema.parse({ ...person, placements: resolved, photo: photoUrl ? { action: 'URL', url: photoUrl } : { action: 'UPLOAD' } });
    return value as ImportPerson;
  });
  if (new Set(people.map(person => person.slug)).size !== people.length) throw new Error('Duplicate person slug');
  return { ...base, people };
}

async function cloudinaryResolver(cachePath: string) {
  let cache: Record<string, MediaReference> = {};
  try { cache = cacheSchema.parse(JSON.parse(await readFile(cachePath, 'utf8'))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  cloudinary.config({ cloud_name: appEnv.cloudName, api_key: appEnv.cloudinaryApiKey, api_secret: appEnv.cloudinaryApiSecret });
  return async (person: ImportPerson): Promise<MediaReference> => {
    if (!person.localPhoto) throw new Error('Missing local portrait');
    const file = path.join(root, 'front-end/src/assets', person.localPhoto);
    const digest = createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 16);
    const cacheKey = `${person.slug}:${digest}`;
    if (cache[cacheKey]) return cache[cacheKey];
    if (!appEnv.cloudName || !appEnv.cloudinaryApiKey || !appEnv.cloudinaryApiSecret) throw new Error('Cloudinary configuration is required to import the official portraits');
    // Deterministic ID + overwrite:false permits retries after interrupted imports.
    const uploaded = await cloudinary.uploader.upload(file, { resource_type: 'image', public_id: `KHM/team/import-v1/${person.slug}-${digest}`, overwrite: false, allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] });
    const reference = mediaReferenceSchema.parse({ photoUrl: uploaded.secure_url, cloudinaryPublicId: uploaded.public_id, cloudinaryAssetId: uploaded.asset_id });
    cache[cacheKey] = reference;
    const temporary = `${cachePath}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(cache, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, cachePath);
    return reference;
  };
}

export async function importTeam(options: ImportOptions = {}) {
  const manifest = await loadManifest();
  const summary = { people: manifest.people.length, placements: manifest.people.reduce((total, person) => total + person.placements.length, 0), departments: manifest.departments.length, localPortraits: manifest.people.filter(person => person.localPhoto).length };
  if (!options.apply) return { mode: 'dry-run', ...summary, writes: 0, uploads: 0 };
  const prisma = options.prisma ?? new PrismaClient();
  try {
    const existingPeople = await prisma.teamPerson.findMany({ select: { slug: true } });
    const existingSlugs = new Set(existingPeople.map(person => person.slug));
    const resolveMedia = options.resolveMedia ?? await cloudinaryResolver(options.mediaCachePath ?? path.resolve(process.cwd(), '.team-import-media.json'));
    const media = new Map<string, MediaReference>();
    for (const person of manifest.people) if (person.localPhoto && !existingSlugs.has(person.slug)) media.set(person.slug, await resolveMedia(person));
    const applied = await prisma.$transaction(async tx => {
      // Same directory lock used by admin mutations; importer cannot race an editor.
      await tx.teamPageContent.update({ where: { id: 'team' }, data: { directoryVersion: { increment: 1 } } });
      let departmentsCreated = 0;
      const departments = new Map<string, string>();
      for (const item of manifest.departments) {
        const existing = await tx.teamDepartment.findUnique({ where: { key: item.key } });
        if (existing) departments.set(item.key, existing.id);
        else {
          const created = await tx.teamDepartment.create({ data: { ...item, name: item.name as Prisma.InputJsonValue } });
          departments.set(item.key, created.id); departmentsCreated++;
        }
      }
      let peopleCreated = 0;
      for (const person of manifest.people) {
        if (await tx.teamPerson.findUnique({ where: { slug: person.slug } })) continue;
        const { localPhoto, photoUrl, placements, ...fields } = person;
        const mapped = placements.map(placement => {
          const { departmentKey, ...rest } = placement;
          return { ...rest, departmentId: departmentKey ? departments.get(departmentKey)! : null };
        });
        personInputSchema.parse({ ...fields, placements: mapped, photo: localPhoto ? { action: 'UPLOAD' } : { action: 'URL', url: photoUrl } });
        const uploaded = media.get(person.slug);
        if (localPhoto && !uploaded) throw new Error('Official portrait has not been imported');
        await tx.teamPerson.create({ data: {
          ...fields, primaryTitle: fields.primaryTitle as Prisma.InputJsonValue, secondaryTitle: fields.secondaryTitle as Prisma.InputJsonValue,
          photoUrl: uploaded?.photoUrl ?? photoUrl!, photoSource: uploaded ? 'CLOUDINARY_UPLOAD' : 'EXTERNAL_URL',
          cloudinaryPublicId: uploaded?.cloudinaryPublicId, cloudinaryAssetId: uploaded?.cloudinaryAssetId,
          placements: { create: mapped.map(placement => ({ ...placement, customTitle: placement.customTitle as Prisma.InputJsonValue, customSecondaryTitle: placement.customSecondaryTitle as Prisma.InputJsonValue, bio: placement.bio as Prisma.InputJsonValue })) },
        } });
        peopleCreated++;
      }
      const page = await tx.teamPageContent.updateMany({ where: { id: 'team', version: 1 }, data: { copy: manifest.page.copy as Prisma.InputJsonValue, version: { increment: 1 } } });
      return { peopleCreated, departmentsCreated, pageImported: page.count === 1 };
    }, { timeout: 30000 });
    return { mode: 'apply', ...summary, ...applied, peopleSkipped: manifest.people.length - applied.peopleCreated };
  } finally { if (!options.prisma) await prisma.$disconnect(); }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const allowed = new Set(['--apply', '--dry-run', '--media-cache']);
  for (let index = 0; index < args.length; index++) {
    if (!allowed.has(args[index])) throw new Error(`Unknown option: ${args[index]}`);
    if (args[index] === '--media-cache') { if (!args[++index]) throw new Error('Missing media cache path'); }
  }
  if (args.includes('--apply') && args.includes('--dry-run')) throw new Error('Choose --apply or --dry-run');
  const cacheIndex = args.indexOf('--media-cache');
  importTeam({ apply: args.includes('--apply'), mediaCachePath: cacheIndex >= 0 ? path.resolve(args[cacheIndex + 1]) : undefined })
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => { console.error(error instanceof Error ? error.message : 'Team import failed'); process.exitCode = 1; });
}
