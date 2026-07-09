// src/routes/uploads.ts — unggah gambar (logo brand, foto produk) ke object
// storage (Bab 03 §storage). Video hasil render diunggah dari worker.ts
// langsung, ini cuma untuk gambar yang dipilih pengguna dari layar.
import { randomBytes } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { uploadImage, StorageUnavailableError } from "../lib/storage.js";

export const uploadsRouter = Router();

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME[file.mimetype]) return cb(new Error("Format gambar harus PNG, JPEG, atau WEBP"));
    cb(null, true);
  },
});

// POST /uploads/image — form-data field "file" -> { url }
uploadsRouter.post("/uploads/image", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File tidak ada" });

  const ext = ALLOWED_MIME[req.file.mimetype];
  const key = `images/${req.accountId}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

  try {
    const url = await uploadImage(key, req.file.buffer, req.file.mimetype);
    res.status(201).json({ url });
  } catch (err: any) {
    if (err instanceof StorageUnavailableError) {
      return res.status(501).json({ error: err.message });
    }
    console.error(err);
    res.status(502).json({ error: err.message ?? "Gagal unggah gambar" });
  }
});

uploadsRouter.use((err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError || err?.message?.includes("Format gambar")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
