import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, mock, test } from "node:test";
import { Prisma } from "@prisma/client";
import sharp from "sharp";
import { prisma } from "../src/utils/client";
import AppError from "../src/utils/error";
import { assertCompleteOrder, isConfirmedRollback, publicSnapshot, TeamService } from "../src/services/TeamService";
import * as media from "../src/team/media";
import { DEFAULT_TEAM_PAGE_COPY, isPublicImageUrl, localize, normalizeLocale, personInputSchema, validate, validatePhotoAction } from "../src/team/validation";
import { AdminTeamPerson, AdminTeamSnapshot, TeamPersonInput, TeamPlacementInput } from "../src/team/types";

const restorePrismaMethods: Array<() => void> = [];
afterEach(() => {
  mock.restoreAll();
  for (const restore of restorePrismaMethods.splice(0)) restore();
});
const photoUrl = "https://images.example.org/portrait?width=800&format=webp";
const placement = (overrides: Partial<TeamPlacementInput> = {}): TeamPlacementInput => ({
  section: "LEADERSHIP", departmentId: null, countryOverride: null, region: null, sortOrder: 0,
  visible: true, titleSource: "PRIMARY", secondaryTitleSource: "NONE", customTitle: { en: "" },
  customSecondaryTitle: { en: "" }, bio: { en: "English biography", fr: "Biographie française" }, ...overrides,
});
const personInput = (overrides: Partial<TeamPersonInput> = {}): TeamPersonInput => ({
  slug: "sample-person", fullName: "Sample Person", country: "Rwanda", primaryTitle: { en: "Director", fr: "Directrice" },
  secondaryTitle: { en: "Founder" }, profilePath: "/about#sample-person", published: true,
  placements: [placement()], photo: { action: "URL", url: photoUrl }, ...overrides,
});
const person = (overrides: Partial<AdminTeamPerson> = {}): AdminTeamPerson => ({
  id: "5a1aa060-0887-42ec-a33c-71e1b41d8aad", slug: "sample-person", fullName: "Sample Person", country: "Rwanda",
  primaryTitle: { en: "Director", fr: "Directrice" }, secondaryTitle: { en: "Founder" }, profilePath: "/about#sample-person",
  published: true, version: 1, photoUrl, photoSource: "EXTERNAL_URL", placements: [{ ...placement(), id: "db6ecacd-2218-43ea-8ca7-f0290bdfbf36" }], ...overrides,
});
const knownError = (code: string) => new Prisma.PrismaClientKnownRequestError("Simulated database error", { code, clientVersion: "5.22.0" });
const ownedPhoto: media.OwnedTeamPhoto = {
  photoUrl: "https://res.cloudinary.com/test/image/upload/KHM/team/5a1aa060-0887-42ec-a33c-71e1b41d8aad",
  photoSource: "CLOUDINARY_UPLOAD", cloudinaryPublicId: "KHM/team/5a1aa060-0887-42ec-a33c-71e1b41d8aad", cloudinaryAssetId: "owned-asset",
};
const fakeFile = { buffer: Buffer.from("prepared by mocked decoder"), size: 26, mimetype: "image/png" } as Express.Multer.File;

test("image URL validation permits public HTTPS CDN query strings and rejects private or credentialed destinations", () => {
  for (const value of [photoUrl, "https://images.unsplash.com/photo-123?auto=format", "https://[2606:4700:4700::1111]/portrait"]) assert.equal(isPublicImageUrl(value), true, value);
  for (const value of ["javascript:alert(1)", "data:image/png;base64,x", "http://example.com/a", "https://user:password@example.com/a", "https://localhost/a", "https://local.internal/a", "https://127.0.0.1/a", "https://2130706433/a", "https://10.0.0.1/a", "https://172.31.0.1/a", "https://192.168.0.1/a", "https://100.64.0.1/a", "https://[::1]/a", "https://[::ffff:127.0.0.1]/a", "https://[fd00::1]/a", "https://example.com:9443/a"]) assert.equal(isPublicImageUrl(value), false, value);
});

test("publication validation enforces selected English titles, biography, one section placement and photo intent", () => {
  assert.doesNotThrow(() => validate(personInputSchema, personInput()));
  assert.doesNotThrow(() => validate(personInputSchema, personInput({ published: false, primaryTitle: { en: "" }, photo: { action: "KEEP" }, placements: [placement({ bio: { en: "" } })] })));
  for (const input of [
    personInput({ primaryTitle: { en: "" } }), personInput({ placements: [placement({ bio: { en: "" } })] }),
    personInput({ placements: [placement({ titleSource: "CUSTOM" })] }), personInput({ placements: [placement({ secondaryTitleSource: "CUSTOM" })] }),
    personInput({ placements: [placement(), placement()] }), personInput({ placements: [placement({ section: "DEPARTMENTS" })] }),
    personInput({ placements: [placement({ section: "FOUNDERS", region: null })] }), personInput({ photo: { action: "KEEP", url: photoUrl } }),
  ]) assert.throws(() => validate(personInputSchema, input), error => error instanceof AppError && error.status === 400);
  assert.throws(() => validatePhotoAction(personInput({ photo: { action: "UPLOAD" } })), /Choose one photo/);
  assert.throws(() => validatePhotoAction(personInput(), fakeFile), /Only UPLOAD/);
});

test("locale resolution preserves translations and applies field-level English fallback", () => {
  const text = { en: "Founder", fr: "Fondatrice", rw: "", sw: "  " };
  assert.equal(localize(text, "fr"), "Fondatrice");
  assert.equal(localize(text, "rw"), "Founder");
  assert.equal(localize(text, "sw"), "Founder");
  assert.equal(normalizeLocale("unsupported"), "en");
  const input = validate(personInputSchema, personInput({ primaryTitle: text }));
  assert.deepEqual(input.primaryTitle, { en: "Founder", fr: "Fondatrice", rw: "", sw: "" });
});

test("public snapshot resolves shared titles, independent placement content and hides all unpublished records", () => {
  const hiddenDepartment = "91062c61-569f-47b5-877b-4a61a7efce38";
  const snapshot: AdminTeamSnapshot = {
    page: { copy: DEFAULT_TEAM_PAGE_COPY, version: 1 }, directoryVersion: 4,
    departments: [{ id: hiddenDepartment, key: "hidden", name: { en: "Hidden department" }, sortOrder: 0, visible: false, version: 1 }],
    people: [person({ placements: [
      { ...placement(), id: "db6ecacd-2218-43ea-8ca7-f0290bdfbf36" },
      { ...placement({ section: "FOUNDERS", titleSource: "SECONDARY", countryOverride: "China", region: "Asia", bio: { en: "Founder biography" } }), id: "d9bbad14-882b-4d51-9227-2015c2580ea3" },
      { ...placement({ section: "DEPARTMENTS", departmentId: hiddenDepartment }), id: "887e5f66-f219-4a68-9d64-8fbc9e0fd75e" },
    ] }), person({ id: "hidden-person", published: false }), person({ id: "hidden-placement-person", placements: [{ ...placement({ visible: false }), id: "hidden-placement" }] })],
  };
  const result = publicSnapshot(snapshot, "fr");
  assert.equal(result.sections.LEADERSHIP.length, 1);
  assert.equal(result.sections.LEADERSHIP[0].title, "Directrice");
  assert.equal(result.sections.LEADERSHIP[0].bio, "Biographie française");
  assert.equal(result.sections.FOUNDERS[0].title, "Founder");
  assert.equal(result.sections.FOUNDERS[0].country, "China");
  assert.equal(result.sections.FOUNDERS[0].bio, "Founder biography");
  assert.deepEqual(result.sections.DEPARTMENTS, []);
  assert.deepEqual(result.departments, []);
  assert.equal(JSON.stringify(result).includes("cloudinaryPublicId"), false);
});

test("ordering requires a full permutation including hidden placements", () => {
  assert.doesNotThrow(() => assertCompleteOrder(["hidden", "visible"], ["visible", "hidden"]));
  for (const proposed of [["visible"], ["visible", "visible"], ["visible", "foreign"]]) assert.throws(() => assertCompleteOrder(proposed, ["visible", "hidden"]), /exactly once/);
});

test("actual photo decoding rejects mislabeled, truncated, oversized and animated files", async () => {
  const png = await sharp({ create: { width: 10, height: 12, channels: 3, background: "white" } }).png().toBuffer();
  const prepared = await media.prepareTeamPhoto({ buffer: png, size: png.length, mimetype: "image/png" });
  assert.equal((await sharp(prepared).metadata()).width, 10);
  await assert.rejects(media.prepareTeamPhoto({ buffer: png, size: png.length, mimetype: "image/jpeg" }), /decodable/);
  await assert.rejects(media.prepareTeamPhoto({ buffer: png.subarray(0, 35), size: 35, mimetype: "image/png" }), /decodable/);
  await assert.rejects(media.prepareTeamPhoto({ buffer: Buffer.alloc(media.MAX_TEAM_PHOTO_BYTES + 1), size: media.MAX_TEAM_PHOTO_BYTES + 1, mimetype: "image/png" }), error => error instanceof AppError && error.status === 413);
  const frames = Buffer.concat([Buffer.alloc(10 * 10 * 3, 0), Buffer.alloc(10 * 10 * 3, 255)]);
  const animatedWebp = await sharp(frames, { raw: { width: 10, height: 20, channels: 3, pageHeight: 10 } }).webp({ delay: [100, 100], loop: 0 }).toBuffer();
  assert.equal((await sharp(animatedWebp).metadata()).pages, 2);
  await assert.rejects(media.prepareTeamPhoto({ buffer: animatedWebp, size: animatedWebp.length, mimetype: "image/webp" }), /decodable/);
});

test("confirmed rollback classification retains assets when commit outcome is uncertain", () => {
  assert.equal(isConfirmedRollback(new AppError("Conflict", 409)), true);
  assert.equal(isConfirmedRollback(knownError("P2002")), true);
  assert.equal(isConfirmedRollback(knownError("P2034")), true);
  assert.equal(isConfirmedRollback(knownError("P2028")), false);
  assert.equal(isConfirmedRollback(new Error("Connection lost during commit")), false);
});

function simulateUploadedSave() {
  // Prisma exposes dynamic methods with undefined property descriptors; use a
  // reversible assignment instead of node:test's descriptor-based mock.method.
  const originalFindUnique = prisma.teamPerson.findUnique;
  prisma.teamPerson.findUnique = (async () => null) as typeof originalFindUnique;
  restorePrismaMethods.push(() => { prisma.teamPerson.findUnique = originalFindUnique; });
  mock.method(media, "prepareTeamPhoto", async () => Buffer.from("prepared"));
  return mock.method(media, "uploadPreparedTeamPhoto", async () => ownedPhoto);
}

test("save compensates a confirmed failed commit by deleting only the new owned upload", async () => {
  const uploaded = simulateUploadedSave();
  mock.method(prisma, "$transaction", async () => { throw knownError("P2002"); });
  const discarded = mock.method(media, "discardOwnedTeamPhoto", async () => undefined);
  await assert.rejects(TeamService.savePerson(personInput({ photo: { action: "UPLOAD" } }), fakeFile), error => error instanceof AppError && error.status === 409);
  assert.equal(uploaded.mock.callCount(), 1);
  assert.equal(discarded.mock.callCount(), 1);
  assert.equal(discarded.mock.calls[0].arguments[0], ownedPhoto);
});

test("uncertain commit keeps the new photo and cleanup failure preserves the original save error", async () => {
  simulateUploadedSave();
  const uncertain = new Error("Connection lost while committing");
  const transaction = mock.method(prisma, "$transaction", async () => { throw uncertain; });
  const discarded = mock.method(media, "discardOwnedTeamPhoto", async () => { throw new Error("Cloudinary unavailable"); });
  mock.method(console, "error", () => undefined);
  await assert.rejects(TeamService.savePerson(personInput({ photo: { action: "UPLOAD" } }), fakeFile), error => error === uncertain);
  assert.equal(discarded.mock.callCount(), 0);
  transaction.mock.mockImplementation(async () => { throw knownError("P2002"); });
  await assert.rejects(TeamService.savePerson(personInput({ photo: { action: "UPLOAD" } }), fakeFile), error => error instanceof AppError && error.status === 409);
  assert.equal(discarded.mock.callCount(), 1);
});

test("upload failure leaves the database untouched", async () => {
  simulateUploadedSave().mock.mockImplementation(async () => { throw new AppError("Upload unavailable", 502); });
  const transaction = mock.method(prisma, "$transaction", async () => undefined);
  await assert.rejects(TeamService.savePerson(personInput({ photo: { action: "UPLOAD" } }), fakeFile), error => error instanceof AppError && error.status === 502);
  assert.equal(transaction.mock.callCount(), 0);
});

test("owned photo cleanup refuses external and unrelated Cloudinary assets", async () => {
  await assert.rejects(media.discardOwnedTeamPhoto({ ...ownedPhoto, cloudinaryPublicId: "KHM/existing-product" }), /outside the Team/);
});

test("generated routes authenticate before Team multipart middleware and put department order before id", () => {
  const routes = readFileSync("build/routes.ts", "utf8");
  for (const method of ["post", "put"]) {
    const route = routes.match(new RegExp(`app\\.${method}\\('/api/admin/team/people[^']*',([\\s\\S]*?)async function`));
    assert.ok(route);
    assert.ok(route[1].indexOf('authenticateMiddleware([{"jwt":["ADMIN"]}])') >= 0);
    assert.ok(route[1].indexOf("authenticateMiddleware") < route[1].indexOf("fetchMiddlewares"));
  }
  assert.ok(routes.indexOf("app.put('/api/admin/team/departments/order'") < routes.indexOf("app.put('/api/admin/team/departments/:id'"));
});


test("startup stops after migration failure and never starts the API", () => {
  const directory = mkdtempSync(join(tmpdir(), "gcv-team-startup-"));
  const marker = join(directory, "api-started");
  try {
    writeFileSync(join(directory, "nc"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    writeFileSync(join(directory, "npx"), "#!/bin/sh\nexit 7\n", { mode: 0o755 });
    writeFileSync(join(directory, "npm"), `#!/bin/sh\ntouch '${marker}'\n`, { mode: 0o755 });
    const result = spawnSync("bash", ["start.sh"], { encoding: "utf8", env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, DATABASE_URL: "postgresql://test:test@127.0.0.1:55432/gcv_team_test" } });
    assert.equal(result.status, 7, result.stderr);
    assert.equal(existsSync(marker), false);
    assert.match(result.stdout, /Running Prisma migrations/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
