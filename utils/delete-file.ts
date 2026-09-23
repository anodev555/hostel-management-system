import { mkdir, writeFile, unlink } from "node:fs/promises"
import { access } from "node:fs/promises"
import path from "node:path"

// ...existing code...

export class DeleteFileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DeleteFileError"
  }
}

/** DB value → safe absolute path under public/ */
export function resolveStoredFilePath(
  storedRelativePath: string,
  baseDir = process.cwd()
) {
  if (!storedRelativePath?.trim()) {
    throw new DeleteFileError("No file path provided")
  }

  // Normalize DB values like "/uploads/x.jpg" or "uploads/x.jpg"
  const normalized = storedRelativePath
    .trim()
    .replace(/^[/\\]+/, "")
    .replace(/\\/g, "/")

  // Must live under uploads/
  if (!normalized.startsWith("uploads/")) {
    throw new DeleteFileError("Invalid stored file path")
  }

  const absolutePath = path.normalize(path.join(baseDir, "public", normalized))

  const publicRoot = path.normalize(path.join(baseDir, "public"))
  const relative = path.relative(publicRoot, absolutePath)

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new DeleteFileError("Invalid stored file path")
  }

  return absolutePath
}

export type DeleteFileResult = {
  deleted: boolean
  absolutePath: string
}

/**
 * Delete a file using the relative path stored in DB.
 * Example DB value: "uploads/profileimage/uuid.jpg"
 */
export async function deleteFile(
  storedRelativePath: string
): Promise<DeleteFileResult> {
  const absolutePath = resolveStoredFilePath(storedRelativePath)

  try {
    await access(absolutePath)
  } catch {
    // Already gone — treat as success for idempotent deletes
    return { deleted: false, absolutePath }
  }

  await unlink(absolutePath)
  return { deleted: true, absolutePath }
}
