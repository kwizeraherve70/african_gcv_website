/* eslint-disable no-async-promise-executor */

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
export const expressAuthentication = (
  request: express.Request,
  securityName: string,
  scopes?: string[],
) => {
  if (securityName === "jwt") {
    const token = request.headers["authorization"] as string;
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) {
          reject(new AppError("No token provided", 401));
          return;
        }
        const email = (await verifyToken(token)) as string;
        const user = await prisma.user.findFirst({
          where: { email },
          include: {
            roles: true,
          },
        });

        if (!user) {
          reject(new AppError("Not Authorized", 403));
          return;
        }

        if (scopes && scopes.length > 0) {
          const userRoles = user.roles.map((roleRecord) => roleRecord.role);
          const hasRequiredRole = scopes.some((scope) =>
            userRoles.includes(scope as (typeof userRoles)[number]),
          );
          if (!hasRequiredRole) {
            reject(new AppError("Insufficient permissions", 403));
            return;
          }
        }

        request.user = user as TUser;
        resolve(user);
      } catch (error) {
        reject(new AppError("Not Authorized", 403));
      }
    });
  }
};
