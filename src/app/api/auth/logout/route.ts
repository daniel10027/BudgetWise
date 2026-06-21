import { apiSuccess } from "@/lib/api-response";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = apiSuccess({ message: "Logged out" });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
