import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import { cloudinary } from "../utils/cloudinary";
import AppError from "../utils/error";
import { personInputSchema, validate, validatePhotoAction } from "./validation";
import { TeamPersonInput } from "./types";

// Isolate the maintained parser from the legacy Products/News middleware.
const multer: typeof import("multer") = require("team-multer");
export const MAX_TEAM_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PIXELS = 36_000_000;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_TEAM_PHOTO_BYTES, files: 1, fields: 1, fieldNameSize: 50, fieldSize: 200 * 1024, parts: 2 },
  fileFilter(_req, file, done) {
    if (!acceptedTypes.has(file.mimetype)) return done(new AppError("Choose a JPEG, PNG or WebP photo", 400));
    done(null, true);
  },
}).single("photo");

export interface TeamSaveRequest extends Request { teamInput?: TeamPersonInput; }
const requests = new Map<string, { count: number; until: number }>();
let activeRequests = 0;
/** Runs after tsoa ADMIN authentication. Bounds both upload memory and CPU work. */
export function teamMultipart(req: TeamSaveRequest, res: Response, next: NextFunction): void {
  if (!req.user?.roles?.some(item => item.role === "ADMIN")) return next(new AppError("Admin authentication is required", 403));
  if (!req.is("multipart/form-data")) return next(new AppError("Send one multipart payload field and an optional photo", 415));
  const now = Date.now();
  for (const [id, item] of requests) if (item.until <= now) requests.delete(id);
  const current = requests.get(req.user.id) ?? { count: 0, until: now + 60_000 };
  if (current.count >= 30 || activeRequests >= 4) return next(new AppError("Too many Team saves; please retry shortly", 429));
  current.count += 1;
  requests.set(req.user.id, current);
  activeRequests += 1;
  let released = false;
  const release = () => { if (!released) { released = true; activeRequests -= 1; } };
  res.once("finish", release);
  res.once("close", release);
  parser(req, res, error => {
    if (error) {
      const code = (error as { code?: string }).code;
      return next(error instanceof AppError ? error : new AppError(code === "LIMIT_FILE_SIZE" ? "Photo must be 5 MB or smaller" : "Invalid multipart payload; send one payload and at most one photo", code === "LIMIT_FILE_SIZE" || code === "LIMIT_FIELD_VALUE" ? 413 : 400));
    }
    try {
      if (Object.keys(req.body ?? {}).length !== 1 || typeof req.body.payload !== "string") throw new AppError("Send exactly one JSON payload field", 400);
      let payload: unknown;
      try { payload = JSON.parse(req.body.payload); } catch { throw new AppError("Payload must contain valid JSON", 400); }
      req.teamInput = validate(personInputSchema, payload);
      validatePhotoAction(req.teamInput, req.file);
      next();
    } catch (error) { next(error); }
  });
}

export interface OwnedTeamPhoto {
  photoUrl: string;
  photoSource: "CLOUDINARY_UPLOAD";
  cloudinaryPublicId: string;
  cloudinaryAssetId: string;
}
/** Decode the actual bytes, reject animations/huge images, strip metadata and bound output dimensions. */
export async function prepareTeamPhoto(file: Pick<Express.Multer.File, "buffer" | "size" | "mimetype">): Promise<Buffer> {
  if (!file.buffer?.length || file.buffer.length > MAX_TEAM_PHOTO_BYTES || file.size > MAX_TEAM_PHOTO_BYTES) throw new AppError("Photo must be non-empty and 5 MB or smaller", 413);
  try {
    const image = sharp(file.buffer, { limitInputPixels: MAX_PIXELS, failOn: "warning" });
    const metadata = await image.metadata();
    const formats: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    if (!metadata.format || formats[metadata.format] !== file.mimetype || !metadata.width || !metadata.height || metadata.width > 12000 || metadata.height > 12000 || (metadata.pages ?? 1) > 1) throw new Error("Unsupported image");
    return await image.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).toBuffer();
  } catch { throw new AppError("Photo must be a decodable, non-animated JPEG, PNG or WebP of at most 36 megapixels", 400); }
}
export async function uploadPreparedTeamPhoto(buffer: Buffer): Promise<OwnedTeamPhoto> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "KHM/team", public_id: randomUUID(), resource_type: "image", overwrite: false, timeout: 60_000 }, (error, result) => {
      if (error || !result?.secure_url || !result.public_id || !result.asset_id) return reject(new AppError("Photo upload failed; your saved profile has not changed", 502));
      resolve({ photoUrl: result.secure_url, photoSource: "CLOUDINARY_UPLOAD", cloudinaryPublicId: result.public_id, cloudinaryAssetId: result.asset_id });
    });
    stream.on("error", () => reject(new AppError("Photo upload failed; your saved profile has not changed", 502)));
    stream.end(buffer);
  });
}
/** Only accepts IDs returned by our uploader; external URLs are never deletion candidates. */
export async function discardOwnedTeamPhoto(photo: OwnedTeamPhoto): Promise<void> {
  if (!/^KHM\/team\/[0-9a-f-]{36}$/.test(photo.cloudinaryPublicId)) throw new Error("Refusing to delete an asset outside the Team upload namespace");
  await cloudinary.uploader.destroy(photo.cloudinaryPublicId, { resource_type: "image", invalidate: true });
}
