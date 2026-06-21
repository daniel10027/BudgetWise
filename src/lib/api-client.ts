import { ApiResponse } from "@/types";

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const json: ApiResponse<T> = await res.json();
    if (!res.ok || !json.success) {
      return { ok: false, error: json.error || "Request failed" };
    }
    return { ok: true, data: json.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
