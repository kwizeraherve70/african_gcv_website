import { createHash, randomBytes } from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./client";
import AppError from "./error";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export const REFRESH_COOKIE_NAME = "gcv_refresh_token";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function cookieValue(request: Request): string | null {
  const header = request.headers.cookie;
  if (!header) return null;
  const entry = header.split(";").find((part) => part.trim().startsWith(`${REFRESH_COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.trim().slice(REFRESH_COOKIE_NAME.length + 1)) : null;
}

export function setRefreshCookie(response: Response, token: string): void {
  const attributes = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/api/auth",
    `Max-Age=${REFRESH_TOKEN_TTL_SECONDS}`,
    "HttpOnly",
    `SameSite=${isProduction() ? "None" : "Lax"}`,
  ];
  if (isProduction()) attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}

export function clearRefreshCookie(response: Response): void {
  const attributes = [
    `${REFRESH_COOKIE_NAME}=`,
    "Path=/api/auth",
    "Max-Age=0",
    "HttpOnly",
    `SameSite=${isProduction() ? "None" : "Lax"}`,
  ];
  if (isProduction()) attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}

export async function issueAccessToken(email: string): Promise<string> {
  return jwt.sign({ email }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export async function createRefreshSession(userId: string, response: Response): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  await prisma.refreshSession.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    },
  });
  setRefreshCookie(response, token);
}

export async function rotateRefreshSession(request: Request, response: Response): Promise<string> {
  const token = cookieValue(request);
  if (!token) throw new AppError("Refresh session not found", 401);

  const currentHash = hashToken(token);
  const session = await prisma.refreshSession.findUnique({ where: { tokenHash: currentHash } });
  if (!session || session.expiresAt <= new Date()) {
    clearRefreshCookie(response);
    throw new AppError("Refresh session expired", 401);
  }
  if (session.revokedAt) {
    await revokeUserSessions(session.userId);
    clearRefreshCookie(response);
    throw new AppError("Refresh session is no longer valid", 401);
  }

  const nextToken = randomBytes(32).toString("base64url");
  const nextHash = hashToken(nextToken);
  await prisma.$transaction([
    prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), replacedByHash: nextHash },
    }),
    prisma.refreshSession.create({
      data: {
        tokenHash: nextHash,
        userId: session.userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    }),
  ]);
  setRefreshCookie(response, nextToken);
  return session.userId;
}

export async function revokeRefreshSession(request: Request, response: Response): Promise<void> {
  const token = cookieValue(request);
  if (token) {
    await prisma.refreshSession.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  clearRefreshCookie(response);
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await prisma.refreshSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
