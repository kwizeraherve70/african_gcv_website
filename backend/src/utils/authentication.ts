import type * as express from "express";
import { prisma } from "./client";
import AppError from "./error";
import type { TUser } from "./interfaces/common";
import { verifyToken } from "./jwt";

/**
 * `scopes` comes from tsoa's `@Security("jwt", ["ADMIN", "MERCHANT"])` decorator.
 * An empty/absent scopes list means "any authenticated user" (JWT check only,
 * same as before this role-check gap was fixed) — ownership checks for
 * "merchant can only touch their own resource" still belong in the service
 * layer, since that depends on which resource is being mutated.
 */
export const expressAuthentication = async (
  request: express.Request,
  securityName: string,
  scopes?: string[],
) : Promise<TUser> => {
  if (securityName !== "jwt") {
    throw new AppError("Unsupported authentication scheme", 500);
  }

  const token = request.headers["authorization"];
  if (typeof token !== "string" || !token) {
    throw new AppError("No token provided", 401);
  }

  let email: string;
  try {
    const identity = await verifyToken(token);
    if (typeof identity !== "string") {
      throw new Error("JWT subject must be an email string");
    }
    email = identity;
  } catch {
    throw new AppError("Not Authorized", 401);
  }

  // Keep database failures distinct from authentication failures. The
  // global error handler can now report them as server errors rather than
  // misleadingly telling an admin their token is invalid.
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      roles: true,
    },
  });

  if (!user) {
    throw new AppError("Not Authorized", 401);
  }

  if (scopes && scopes.length > 0) {
    const hasRequiredRole = user.roles.some(({ role }) => scopes.includes(role));
    if (!hasRequiredRole) {
      throw new AppError("Insufficient permissions", 403);
    }
  }

  request.user = user as TUser;
  return user as TUser;
};
