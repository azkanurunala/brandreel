// lib/api.ts — pemanggil API terpusat (Bab 13). Kirim token sesi BrandReel
// (lib/session.ts) sebagai Authorization: Bearer di setiap request.
import { API_BASE } from "../constants/api";
import { getToken, clearToken } from "./session";

export class UnauthorizedError extends Error {
  constructor() {
    super("Sesi login berakhir — silakan masuk lagi");
    this.name = "UnauthorizedError";
  }
}

async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function handle(res: Response, path: string) {
  if (res.status === 401) {
    await clearToken();
    throw new UnauthorizedError();
  }
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: await authHeaders() });
  return handle(res, path);
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handle(res, path);
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return handle(res, path);
}
