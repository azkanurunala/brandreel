// lib/imageUpload.ts — pilih gambar dari galeri lalu unggah ke backend
// (POST /uploads/image, Bab 03) — dipakai buat logo brand & foto produk.
import { Platform } from "react-native";
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

  if (Platform.OS === "web") {
    // Web: ImagePicker balikkan File asli di asset.file kalau ada; kalau
    // tidak, asset.uri itu blob:/data: URI — fetch balik jadi Blob asli
    // (RN-style {uri,name,type} bukan format yang browser FormData ngerti).
    const file = (asset as unknown as { file?: File }).file;
    if (file) {
      const { url } = await apiUpload("/uploads/image", file);
      return url;
    }
    const blob = await (await fetch(asset.uri)).blob();
    const { url } = await apiUpload("/uploads/image", blob);
    return url;
  }

  const { name, type } = extToMime(asset.uri);
  const { url } = await apiUpload("/uploads/image", { uri: asset.uri, name, type });
  return url;
}
