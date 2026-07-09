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

export async function apiPut(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
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

// Unggah file (form-data, field "file") — dipakai buat logo brand & foto
// produk (Bab 03). JANGAN set Content-Type manual — fetch/browser yang
// mengisi boundary multipart-nya sendiri.
// Native (RN fetch polyfill) butuh objek {uri,name,type}; browser beneran
// butuh Blob/File asli — objek {uri,name,type} cuma jadi "[object Object]"
// kalau di-append ke FormData browser, bikin backend nolak 400.
export async function apiUpload(path: string, file: { uri: string; name: string; type: string } | File | Blob) {
  const form = new FormData();
  if (file instanceof Blob) {
    form.append("file", file, "name" in file ? (file as File).name : "upload");
  } else {
    form.append("file", { uri: file.uri, name: file.name, type: file.type } as any);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: form,
  });
  return handle(res, path);
}
