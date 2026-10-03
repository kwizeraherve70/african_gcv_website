import { Prisma, TeamDepartment, TeamPageContent } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../utils/client";
import AppError from "../utils/error";
import { AdminTeamDepartment, AdminTeamPage, AdminTeamPerson, AdminTeamSnapshot, PublicTeamPerson, PublicTeamPlacement, PublicTeamSnapshot, TeamDepartmentInput, TeamLocale, TeamOrderInput, TeamPageInput, TeamPersonInput, TeamSection, TeamTitleSource, TEAM_PAGE_FIELDS, TEAM_SECTIONS, LocalizedText } from "../team/types";
import { departmentInputSchema, imageUrlSchema, localize, localizedTextSchema, normalizeLocale, orderInputSchema, pageCopySchema, pageInputSchema, personInputSchema, placementSchema, validate, validatePhotoAction } from "../team/validation";
import { discardOwnedTeamPhoto, OwnedTeamPhoto, prepareTeamPhoto, uploadPreparedTeamPhoto } from "../team/media";

type Transaction = Prisma.TransactionClient;
type PersonRow = Prisma.TeamPersonGetPayload<{ include: { placements: true } }>;
const conflict = () => new AppError("This content changed while you were editing. Reload before saving.", 409);
const json = (value: object): Prisma.InputJsonValue => value as Prisma.InputJsonObject;

function personDto(row: PersonRow): AdminTeamPerson {
  return {
    id: row.id, slug: row.slug, fullName: row.fullName, country: row.country,
    primaryTitle: localizedTextSchema.parse(row.primaryTitle), secondaryTitle: localizedTextSchema.parse(row.secondaryTitle),
    profilePath: row.profilePath, published: row.published, version: row.version,
    photoUrl: row.photoUrl, photoSource: row.photoSource,
    placements: row.placements.map(placement => ({ ...placementSchema.parse({
      id: placement.id, section: placement.section, departmentId: placement.departmentId,
      countryOverride: placement.countryOverride, region: placement.region, sortOrder: placement.sortOrder,
      visible: placement.visible, titleSource: placement.titleSource, secondaryTitleSource: placement.secondaryTitleSource,
      customTitle: placement.customTitle, customSecondaryTitle: placement.customSecondaryTitle, bio: placement.bio,
    }), id: placement.id })).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
  };
}
function departmentDto(row: TeamDepartment): AdminTeamDepartment {
  return { id: row.id, key: row.key, name: localizedTextSchema.parse(row.name), sortOrder: row.sortOrder, visible: row.visible, version: row.version };
}
function pageDto(row: TeamPageContent): AdminTeamPage { return { copy: pageCopySchema.parse(row.copy), version: row.version }; }
async function readSnapshot(tx: Transaction): Promise<AdminTeamSnapshot> {
  const [people, departments, page] = await Promise.all([
    tx.teamPerson.findMany({ include: { placements: true }, orderBy: [{ fullName: "asc" }, { id: "asc" }] }),
    tx.teamDepartment.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    tx.teamPageContent.findUnique({ where: { id: "team" } }),
  ]);
  if (!page) throw new AppError("The Team directory has not been initialized", 503);
  return { people: people.map(personDto), departments: departments.map(departmentDto), page: pageDto(page), directoryVersion: page.directoryVersion };
}
function resolveTitle(source: TeamTitleSource, custom: LocalizedText, person: AdminTeamPerson, locale: TeamLocale): string {
  return source === "NONE" ? "" : localize(source === "PRIMARY" ? person.primaryTitle : source === "SECONDARY" ? person.secondaryTitle : custom, locale);
}
function publicPerson(person: AdminTeamPerson, locale: TeamLocale): PublicTeamPerson {
  return { id: person.id, slug: person.slug, fullName: person.fullName, country: person.country, primaryTitle: localize(person.primaryTitle, locale), secondaryTitle: localize(person.secondaryTitle, locale), photoUrl: person.photoUrl, profilePath: person.profilePath };
}
export function publicSnapshot(snapshot: AdminTeamSnapshot, locale: TeamLocale): PublicTeamSnapshot {
  const departments = snapshot.departments.filter(department => department.visible).map(department => ({ id: department.id, key: department.key, name: localize(department.name, locale), sortOrder: department.sortOrder }));
  const departmentMap = new Map(departments.map(department => [department.id, department]));
  const sections: Record<TeamSection, PublicTeamPlacement[]> = { LEADERSHIP: [], FOUNDERS: [], DEPARTMENTS: [] };
  for (const person of snapshot.people) {
    if (!person.published) continue;
    for (const placement of person.placements) {
      if (!placement.visible || placement.departmentId && !departmentMap.has(placement.departmentId)) continue;
      sections[placement.section].push({
        id: placement.id, personId: person.id, slug: person.slug, fullName: person.fullName, photoUrl: person.photoUrl, profilePath: person.profilePath,
        country: placement.countryOverride || person.country, region: placement.region, departmentId: placement.departmentId,
        departmentName: placement.departmentId ? departmentMap.get(placement.departmentId)?.name ?? null : null,
        title: resolveTitle(placement.titleSource, placement.customTitle, person, locale), secondaryTitle: resolveTitle(placement.secondaryTitleSource, placement.customSecondaryTitle, person, locale),
        bio: localize(placement.bio, locale), sortOrder: placement.sortOrder,
      });
    }
  }
  for (const section of TEAM_SECTIONS) sections[section].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const page = Object.fromEntries(TEAM_PAGE_FIELDS.map(field => [field, localize(snapshot.page.copy[field], locale)])) as PublicTeamSnapshot["page"];
  return { locale, page, departments, sections };
}
/** Every write takes this singleton row lock first, serializing directory changes. */
async function bumpDirectory(tx: Transaction, expected?: number): Promise<void> {
  const result = await tx.teamPageContent.updateMany({ where: { id: "team", ...(expected === undefined ? {} : { directoryVersion: expected }) }, data: { directoryVersion: { increment: 1 } } });
  if (result.count !== 1) throw conflict();
}
function translateDatabaseError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") throw new AppError("This slug, key or section placement is already in use", 409);
    if (error.code === "P2003") throw new AppError("A referenced person or department no longer exists", 400);
    if (error.code === "P2034") throw conflict();
  }
  throw error;
}
/** Conservative compensation: transport/commit-ack errors retain media for reconciliation. */
export function isConfirmedRollback(error: unknown): boolean {
  return error instanceof AppError || error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2025", "P2034"].includes(error.code);
}
async function checkPersonReferences(tx: Transaction, input: TeamPersonInput, existing: PersonRow | null): Promise<void> {
  if (existing) {
    if (input.slug !== existing.slug) throw new AppError("A person's slug cannot be changed", 400);
    if (input.version !== existing.version) throw conflict();
    const ids = new Set(existing.placements.map(placement => placement.id));
    if (input.placements.some(placement => placement.id && !ids.has(placement.id))) throw new AppError("A placement does not belong to this person", 400);
  } else if (input.version !== undefined || input.placements.some(placement => placement.id)) throw new AppError("New people cannot supply record versions or placement IDs", 400);
  const departments = input.placements.flatMap(placement => placement.departmentId ? [placement.departmentId] : []);
  if (departments.length && await tx.teamDepartment.count({ where: { id: { in: departments } } }) !== new Set(departments).size) throw new AppError("A selected department does not exist", 400);
}

export class TeamService {
  static async getAdminSnapshot(): Promise<AdminTeamSnapshot> { return prisma.$transaction(readSnapshot, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }); }
  static async getPublicSnapshot(locale?: string): Promise<PublicTeamSnapshot> { return publicSnapshot(await this.getAdminSnapshot(), normalizeLocale(locale)); }
  static async getAdminPerson(id: string): Promise<AdminTeamPerson> {
    const person = await prisma.teamPerson.findUnique({ where: { id }, include: { placements: true } });
    if (!person) throw new AppError("Team person not found", 404);
    return personDto(person);
  }
  static async getPublicPerson(slug: string, locale?: string): Promise<PublicTeamPerson> {
    const person = await prisma.teamPerson.findUnique({ where: { slug }, include: { placements: true } });
    if (!person?.published) throw new AppError("Team person not found", 404);
    return publicPerson(personDto(person), normalizeLocale(locale));
  }
  static async savePerson(rawInput: TeamPersonInput, file?: Express.Multer.File, id?: string): Promise<AdminTeamPerson> {
    const input = validate(personInputSchema, rawInput);
    validatePhotoAction(input, file);
    const existing = id ? await prisma.teamPerson.findUnique({ where: { id }, include: { placements: true } }) : null;
    if (id && !existing) throw new AppError("Team person not found", 404);
    await checkPersonReferences(prisma, input, existing);
    if (input.published && input.photo.action === "KEEP" && !existing?.photoUrl) throw new AppError("A photo is required to publish", 400);
    let freshPhoto: OwnedTeamPhoto | undefined;
    if (file) freshPhoto = await uploadPreparedTeamPhoto(await prepareTeamPhoto(file));
    const photoData = freshPhoto ?? (input.photo.action === "URL" ? { photoUrl: validate(imageUrlSchema, input.photo.url), photoSource: "EXTERNAL_URL" as const, cloudinaryPublicId: null, cloudinaryAssetId: null } : {});
    try {
      return await prisma.$transaction(async tx => {
        await bumpDirectory(tx);
        const current = id ? await tx.teamPerson.findUnique({ where: { id }, include: { placements: true } }) : null;
        if (id && !current) throw new AppError("Team person not found", 404);
        await checkPersonReferences(tx, input, current);
        const data = { fullName: input.fullName, country: input.country, primaryTitle: json(input.primaryTitle), secondaryTitle: json(input.secondaryTitle), profilePath: input.profilePath, published: input.published, ...photoData };
        let personId = id;
        if (personId) {
          const changed = await tx.teamPerson.updateMany({ where: { id: personId, version: input.version }, data: { ...data, version: { increment: 1 } } });
          if (changed.count !== 1) throw conflict();
          await tx.teamPlacement.deleteMany({ where: { personId } });
        } else {
          personId = (await tx.teamPerson.create({ data: { ...data, slug: input.slug } })).id;
        }
        if (input.placements.length) await tx.teamPlacement.createMany({ data: input.placements.map(placement => ({
          ...placement, id: placement.id ?? randomUUID(), personId: personId!, customTitle: json(placement.customTitle), customSecondaryTitle: json(placement.customSecondaryTitle), bio: json(placement.bio),
        })) });
        return personDto(await tx.teamPerson.findUniqueOrThrow({ where: { id: personId }, include: { placements: true } }));
      });
    } catch (error) {
      if (freshPhoto && isConfirmedRollback(error)) {
        try { await discardOwnedTeamPhoto(freshPhoto); }
        catch { console.error("Team upload cleanup failed; owned asset requires reconciliation", freshPhoto.cloudinaryPublicId); }
      } else if (freshPhoto) console.error("Team save outcome uncertain; retain uploaded asset for reconciliation", freshPhoto.cloudinaryPublicId);
      return translateDatabaseError(error);
    }
  }
  static async saveDepartment(rawInput: TeamDepartmentInput, id?: string): Promise<AdminTeamDepartment> {
    const input = validate(departmentInputSchema, rawInput);
    try {
      return await prisma.$transaction(async tx => {
        await bumpDirectory(tx);
        const current = id ? await tx.teamDepartment.findUnique({ where: { id } }) : null;
        if (id && !current) throw new AppError("Department not found", 404);
        if (current && (current.key !== input.key || input.version === undefined)) throw new AppError("Department key is immutable and an update version is required", 400);
        if (current && current.version !== input.version) throw conflict();
        if (!id && input.version !== undefined) throw new AppError("New departments cannot supply a version", 400);
        const data = { name: json(input.name), sortOrder: input.sortOrder, visible: input.visible };
        const result = id ? await tx.teamDepartment.update({ where: { id }, data: { ...data, version: { increment: 1 } } }) : await tx.teamDepartment.create({ data: { ...data, key: input.key } });
        return departmentDto(result);
      });
    } catch (error) { return translateDatabaseError(error); }
  }
  static async savePage(rawInput: TeamPageInput): Promise<AdminTeamPage> {
    const input = validate(pageInputSchema, rawInput);
    return prisma.$transaction(async tx => {
      await bumpDirectory(tx);
      const result = await tx.teamPageContent.updateMany({ where: { id: "team", version: input.version }, data: { copy: json(input.copy), version: { increment: 1 } } });
      if (result.count !== 1) throw conflict();
      return pageDto(await tx.teamPageContent.findUniqueOrThrow({ where: { id: "team" } }));
    });
  }
  static async reorderSection(section: TeamSection, rawInput: TeamOrderInput): Promise<AdminTeamSnapshot> {
    if (!TEAM_SECTIONS.includes(section)) throw new AppError("Unknown Team section", 400);
    const input = validate(orderInputSchema, rawInput);
    return prisma.$transaction(async tx => {
      await bumpDirectory(tx, input.directoryVersion);
      const placements = await tx.teamPlacement.findMany({ where: { section }, select: { id: true, personId: true } });
      assertCompleteOrder(input.ids, placements.map(placement => placement.id));
      for (let index = 0; index < input.ids.length; index++) await tx.teamPlacement.update({ where: { id: input.ids[index] }, data: { sortOrder: index } });
      await tx.teamPerson.updateMany({ where: { id: { in: [...new Set(placements.map(placement => placement.personId))] } }, data: { version: { increment: 1 } } });
      return readSnapshot(tx);
    }, { timeout: 15_000 });
  }
  static async reorderDepartments(rawInput: TeamOrderInput): Promise<AdminTeamSnapshot> {
    const input = validate(orderInputSchema, rawInput);
    return prisma.$transaction(async tx => {
      await bumpDirectory(tx, input.directoryVersion);
      const departments = await tx.teamDepartment.findMany({ select: { id: true } });
      assertCompleteOrder(input.ids, departments.map(department => department.id));
      for (let index = 0; index < input.ids.length; index++) await tx.teamDepartment.update({ where: { id: input.ids[index] }, data: { sortOrder: index, version: { increment: 1 } } });
      return readSnapshot(tx);
    }, { timeout: 15_000 });
  }
}
export function assertCompleteOrder(proposed: string[], existing: string[]): void {
  const expected = new Set(existing);
  if (proposed.length !== existing.length || new Set(proposed).size !== proposed.length || proposed.some(id => !expected.has(id))) throw new AppError("Supply every current record in this section exactly once", 400);
}
