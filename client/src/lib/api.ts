import { DEMO_TOKEN, demoApi, isDemoLogin } from "./demo";

export const TOKEN_KEY = "shelfsense_token";

export class ApiError extends Error {}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const demo =
    token === DEMO_TOKEN || path === "/api/auth/demo" || (path === "/api/auth/login" && isDemoLogin(options.body));
  if (demo) return (await demoApi(path, options)) as T;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(path, { method: options.method ?? "GET", headers, body });
  const text = await response.text();
  let data: { error?: string } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { error?: string };
    } catch {
      throw new ApiError("The server returned an unexpected response");
    }
  }
  if (!response.ok) {
    throw new ApiError(data.error || "Something went wrong");
  }
  return data as T;
}
