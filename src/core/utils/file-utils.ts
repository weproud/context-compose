import { constants } from 'node:fs';
import { access, copyFile, mkdir, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Checks if a file or directory exists.
 * @param filePath - The path to check.
 * @returns A promise that resolves to true if the path exists, false otherwise.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies a directory recursively from a source to a destination.
 * @param src - The source directory path.
 * @param dest - The destination directory path.
 * @returns A promise that resolves to an array of copied file paths.
 */
export async function copyDirectory(
  src: string,
  dest: string
): Promise<string[]> {
  const copiedFiles: string[] = [];
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  await Promise.all(
    entries.map(async entry => {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await copyDirectory(srcPath, destPath);
        copiedFiles.push(...subFiles);
      } else {
        await copyFile(srcPath, destPath);
        copiedFiles.push(destPath);
      }
    })
  );

  return copiedFiles;
}

/**
 * Creates a timestamped backup of a directory.
 * @param dirPath - The directory to back up.
 * @returns A promise that resolves to the path of the backup directory.
 */
export async function backupDirectory(dirPath: string): Promise<string> {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5); // YYYY-MM-DD_HH-MM-SS
  const backupPath = `${dirPath}-${timestamp}`;
  await rename(dirPath, backupPath);
  return backupPath;
}
