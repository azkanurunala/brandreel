// lib/api.ts — pemanggil API terpusat (Bab 13)
import { API_BASE } from "../constants/api";

async function handle(res: Response, path: string) {
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  return handle(res, path);
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handle(res, path);
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle(res, path);
}
