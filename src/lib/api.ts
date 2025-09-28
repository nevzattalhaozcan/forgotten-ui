export const API_BASE = import.meta.env.VITE_API_URL || "";

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  { auth = true }: { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
    ...(auth ? authHeader() : {}),
  };

  // Clean up URL construction to avoid double slashes
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = baseUrl + cleanPath;

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let detail: unknown;
    try { detail = await res.json(); } catch { /* ignore */ }
    const err = new Error(`API ${res.status}`) as Error & { status?: number; detail?: unknown };
    err.status = res.status; err.detail = detail;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? (await res.json()) as T : (undefined as T);
}
