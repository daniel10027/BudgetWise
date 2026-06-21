import { NextRequest } from "next/server";
import { getAuthUser, JwtPayload } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function requireAuth(req: NextRequest): JwtPayload {
  const auth = getAuthUser(req);
  if (!auth) {
    throw new UnauthorizedError();
  }
  return auth;
}

export function requireAdmin(req: NextRequest): JwtPayload {
  const auth = requireAuth(req);
  if (auth.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  return auth;
}
