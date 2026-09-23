import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

/** Defaults for profile images — override per call */
export const DEFAULT_IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
export const DEFAULT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const

/** Defaults for documents (NID, PDF, etc.) */
export const DEFAULT_DOC_MAX_SIZE = 10 * 1024 * 1024 // 10MB
export const DEFAULT_DOC_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const

export type UploadFileOptions = {
  file: File
  /** e.g. "public/uploads/profileimage" or "/public/uploads/docs" */
  destinationFolder: string
  /** Required — no upload without explicit limits */
  maxSizeBytes: number
  allowedMimeTypes: readonly string[]
}

export type UploadFileResult = {
  fileSize: number
  fileName: string
  relativePath: string
  absolutePath: string
  publicUrl?: string
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UploadValidationError"
  }
}

export function validateUploadFile(
  file: File,
  maxSizeBytes: number,
  allowedMimeTypes: readonly string[]
): void {
  if (!file || file.size === 0) {
    throw new UploadValidationError("No file provided")
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024))
    throw new UploadValidationError(`File must be less than ${maxMb}MB`)
  }

  if (!allowedMimeTypes.includes(file.type)) {
    throw new UploadValidationError(
      `File type not allowed. Accepted: ${allowedMimeTypes.join(", ")}`
    )
  }
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
}

function getExtension(file: File): string {
  const ext = MIME_TO_EXT[file.type]
  if (ext) return ext
  throw new UploadValidationError("Could not determine file extension")
}

function resolveSafeFolder(folder: string, baseDir = process.cwd()) {
  const normalized = folder.replace(/^[/\\]+/, "")
  const absoluteFolder = path.normalize(path.join(baseDir, normalized))

  const relative = path.relative(baseDir, absoluteFolder)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new UploadValidationError("Invalid destination folder")
  }

  return absoluteFolder
}

export async function uploadFile(
  options: UploadFileOptions
): Promise<UploadFileResult> {
  const { file, destinationFolder, maxSizeBytes, allowedMimeTypes } = options

  // 1. Validate before touching disk
  validateUploadFile(file, maxSizeBytes, allowedMimeTypes)
  const fileSize = file.size
  const folder = resolveSafeFolder(destinationFolder)
  const fileName = `${randomUUID()}.${getExtension(file)}`
  const absolutePath = path.join(folder, fileName)

  await mkdir(folder, { recursive: true })
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()))

  const publicRoot = path.join(process.cwd(), "public")
  const publicUrl = absolutePath.startsWith(publicRoot)
    ? `/${path.relative(publicRoot, absolutePath).replace(/\\/g, "/")}`
    : undefined

  const relativePath = path
    .relative(process.cwd(), absolutePath)
    .replace(/^public[/\\]/, "")
    .replace(/\\/g, "/")

  return { fileName, relativePath, absolutePath, publicUrl, fileSize }
}

/** Convenience wrapper for images */
export function uploadImage(
  file: File,
  destinationFolder: string,
  overrides?: {
    maxSizeBytes?: number
    allowedMimeTypes?: readonly string[]
  }
) {
  return uploadFile({
    file,
    destinationFolder,
    maxSizeBytes: overrides?.maxSizeBytes ?? DEFAULT_IMAGE_MAX_SIZE,
    allowedMimeTypes: overrides?.allowedMimeTypes ?? DEFAULT_IMAGE_MIME_TYPES,
  })
}
