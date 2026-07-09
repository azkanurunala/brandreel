// lib/imageUpload.ts — pilih gambar dari galeri lalu unggah ke backend
// (POST /uploads/image, Bab 03) — dipakai buat logo brand & foto produk.
import * as ImagePicker from "expo-image-picker";
import { apiUpload } from "./api";

function extToMime(uri: string): { name: string; type: string } {
  const ext = (uri.split(".").pop() ?? "jpg").toLowerCase();
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { name: `upload.${ext === "jpg" ? "jpg" : ext}`, type };
}

// Balikkan URL gambar hasil unggah, atau null kalau pengguna batal / gagal.
export async function pickAndUploadImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    allowsEditing: true,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const { name, type } = extToMime(asset.uri);
  const { url } = await apiUpload("/uploads/image", { uri: asset.uri, name, type });
  return url;
}
