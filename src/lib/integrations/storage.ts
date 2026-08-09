/**
 * File storage integration boundary.
 *
 * Real usage: attach Vercel Blob storage to the Vercel project (this sets
 * BLOB_READ_WRITE_TOKEN automatically), and every upload path below writes to
 * Blob instead of local disk. Vercel's serverless functions have an ephemeral,
 * read-only filesystem outside /tmp, so local-disk writes silently don't
 * persist in production, hence this boundary rather than a direct fs call.
 *
 * Dev default: no token set, files are written to public/uploads on local
 * disk, which works fine for `next dev` / self-hosted Node deployments.
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface UploadedFile {
  url: string;
}

export interface StorageClient {
  uploadFile(input: { filename: string; buffer: Buffer; contentType?: string }): Promise<UploadedFile>;
}

function safeFilename(filename: string) {
  return `${randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

class LocalDiskStorageClient implements StorageClient {
  async uploadFile(input: { filename: string; buffer: Buffer }): Promise<UploadedFile> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const name = safeFilename(input.filename);
    await writeFile(path.join(uploadsDir, name), input.buffer);
    return { url: `/uploads/${name}` };
  }
}

class VercelBlobStorageClient implements StorageClient {
  async uploadFile(input: { filename: string; buffer: Buffer; contentType?: string }): Promise<UploadedFile> {
    const { put } = await import("@vercel/blob");
    const blob = await put(safeFilename(input.filename), input.buffer, {
      access: "public",
      contentType: input.contentType,
    });
    return { url: blob.url };
  }
}

export function createStorageClient(): StorageClient {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return new VercelBlobStorageClient();
  }
  console.warn("[storage] BLOB_READ_WRITE_TOKEN is not set, falling back to local-disk storage (dev only).");
  return new LocalDiskStorageClient();
}
