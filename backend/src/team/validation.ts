import { isIP } from "node:net";
import { z } from "zod";
import AppError from "../utils/error";
import { TEAM_LOCALES, TEAM_PAGE_FIELDS, TEAM_SECTIONS, LocalizedText, TeamLocale, TeamPersonInput } from "./types";

const text = (length: number) => z.string().trim().max(length);
export const localizedTextSchema = z.object({ en: text(8000), fr: text(8000).optional(), rw: text(8000).optional(), sw: text(8000).optional() }).strict();
const shortLocalized = localizedTextSchema.superRefine((value, context) => {
  for (const locale of TEAM_LOCALES) if ((value[locale]?.length ?? 0) > 300) context.addIssue({ code: z.ZodIssueCode.custom, path: [locale], message: "Must be at most 300 characters" });
});
const version = z.number().int().min(1).max(2147483646);
const order = z.number().int().min(0).max(1000000);
const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);

export function isPublicImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return false;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    if (host === "localhost" || !host.includes(".") && isIP(host) === 0 || /\.(localhost|local|internal|lan|home|test|invalid)$/.test(host)) return false;
    if (isIP(host) === 4) {
      const [a, b] = host.split(".").map(Number);
      return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19));
    }
    // Accept global unicast IPv6 only; exclude mapped/loopback/link-local/private addresses.
    if (isIP(host) === 6) return /^[23]/.test(host);
    return true;
  } catch { return false; }
}
export const imageUrlSchema = z.string().trim().max(2048).refine(isPublicImageUrl, "Use a public HTTPS image URL without credentials or a private address");
const profilePath = z.string().max(500).regex(/^\/(?!\/)[A-Za-z0-9/_#?=&.%~-]*$/, "Use an internal site path").nullable();
const titleSource = z.enum(["PRIMARY", "SECONDARY", "CUSTOM", "NONE"]);
export const placementSchema = z.object({
  id: z.string().uuid().optional(), section: z.enum(TEAM_SECTIONS), departmentId: z.string().uuid().nullable(),
  countryOverride: text(100).nullable(), region: z.enum(["Africa", "Europe", "Asia", "USA"]).nullable(),
  sortOrder: order, visible: z.boolean(), titleSource, secondaryTitleSource: titleSource,
  customTitle: shortLocalized, customSecondaryTitle: shortLocalized, bio: localizedTextSchema,
}).strict().superRefine((value, context) => {
  if ((value.section === "DEPARTMENTS") !== Boolean(value.departmentId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["departmentId"], message: "Department is required only for department placements" });
  if (value.section === "FOUNDERS" && !value.region) context.addIssue({ code: z.ZodIssueCode.custom, path: ["region"], message: "Founder region is required" });
  if (value.section !== "FOUNDERS" && value.region !== null) context.addIssue({ code: z.ZodIssueCode.custom, path: ["region"], message: "Region is only used for founders" });
});
export const personInputSchema = z.object({
  slug: key, fullName: text(200).min(1), country: text(100), primaryTitle: shortLocalized, secondaryTitle: shortLocalized,
  profilePath, published: z.boolean(), version: version.optional(), placements: z.array(placementSchema).max(3),
  photo: z.object({ action: z.enum(["KEEP", "UPLOAD", "URL"]), url: imageUrlSchema.optional() }).strict(),
}).strict().superRefine((value, context) => {
  if (new Set(value.placements.map(item => item.section)).size !== value.placements.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ["placements"], message: "A person can have one placement per section" });
  if (value.photo.action === "URL" && !value.photo.url || value.photo.action !== "URL" && value.photo.url !== undefined) context.addIssue({ code: z.ZodIssueCode.custom, path: ["photo", "url"], message: "A photo URL is required only for URL mode" });
  if (value.published) {
    if (!value.primaryTitle.en) context.addIssue({ code: z.ZodIssueCode.custom, path: ["primaryTitle", "en"], message: "English primary title is required to publish" });
    value.placements.forEach((placement, index) => {
      if (!placement.visible) return;
      if (!placement.bio.en) context.addIssue({ code: z.ZodIssueCode.custom, path: ["placements", index, "bio", "en"], message: "English biography is required to publish" });
      const resolve = (source: string, custom: LocalizedText) => source === "PRIMARY" ? value.primaryTitle.en : source === "SECONDARY" ? value.secondaryTitle.en : source === "CUSTOM" ? custom.en : "";
      if (!resolve(placement.titleSource, placement.customTitle)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["placements", index, "titleSource"], message: "A visible placement needs an English title" });
      if (placement.secondaryTitleSource !== "NONE" && !resolve(placement.secondaryTitleSource, placement.customSecondaryTitle)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["placements", index, "secondaryTitleSource"], message: "Selected secondary title needs English content" });
    });
  }
});
export const departmentInputSchema = z.object({ key, name: shortLocalized.refine(value => Boolean(value.en), "English department name is required"), sortOrder: order, visible: z.boolean(), version: version.optional() }).strict();
const requiredPageText = localizedTextSchema.refine(value => Boolean(value.en), "English page wording is required");
export const pageCopySchema = z.object({
  heroBadge: requiredPageText, heroTitle: requiredPageText, heroSubtitle: requiredPageText,
  leadershipEyebrow: requiredPageText, leadershipTitle: requiredPageText, foundersEyebrow: requiredPageText, foundersTitle: requiredPageText,
  departmentsEyebrow: requiredPageText, departmentsTitle: requiredPageText, seoTitle: requiredPageText, seoDescription: requiredPageText,
}).strict();
export const pageInputSchema = z.object({ copy: pageCopySchema, version }).strict();
export const orderInputSchema = z.object({ ids: z.array(z.string().uuid()).max(2000), directoryVersion: z.number().int().min(0).max(2147483646) }).strict().refine(value => new Set(value.ids).size === value.ids.length, "Order must not contain duplicate IDs");
export function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new AppError(parsed.error.issues.slice(0, 5).map(issue => `${issue.path.join(".") || "Input"}: ${issue.message}`).join("; "), 400);
  return parsed.data;
}
export function normalizeLocale(value?: string): TeamLocale { return TEAM_LOCALES.includes(value as TeamLocale) ? value as TeamLocale : "en"; }
export function localize(value: unknown, locale: TeamLocale): string {
  const localized = localizedTextSchema.parse(value);
  return localized[locale]?.trim() || localized.en;
}
export function validatePhotoAction(input: TeamPersonInput, file?: Express.Multer.File): void {
  if (input.photo.action === "UPLOAD" ? !file : Boolean(file)) throw new AppError(input.photo.action === "UPLOAD" ? "Choose one photo to upload" : "Only UPLOAD mode accepts a photo file", 400);
}
export const DEFAULT_TEAM_PAGE_COPY = Object.fromEntries(TEAM_PAGE_FIELDS.map(field => [field, { en: ({ heroBadge: "The People Behind the Movement", heroTitle: "GCV Core Team", heroSubtitle: "Meet the leaders building the global GCV community.", leadershipEyebrow: "Global Leadership", leadershipTitle: "Global Leadership", foundersEyebrow: "Our Founders", foundersTitle: "GCV Founders", departmentsEyebrow: "Our Structure", departmentsTitle: "Department Teams", seoTitle: "GCV Core Team", seoDescription: "Meet the GCV leaders, founders and department teams." })[field] }])) as import("./types").TeamPageCopy;
