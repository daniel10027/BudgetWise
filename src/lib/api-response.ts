import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof Error) {
    if (err.name === "UnauthorizedError") {
      return apiError(err.message, 401);
    }
    if (err.name === "ForbiddenError") {
      return apiError(err.message, 403);
    }
    console.error("[API ERROR]", err);
    return apiError(err.message, 500);
  }
  console.error("[API ERROR]", err);
  return apiError("Unexpected server error", 500);
}
