import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { memoizeAsync } from './cache.js';
import { fileExists } from './file-utils.js';

export interface PackageJson {
  version: string;
  name?: string;
  description?: string;
}

/**
 * Find package.json file using multiple strategies (async version)
 */
export async function findPackageJsonAsync(): Promise<PackageJson> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const possiblePaths = [
    // Strategy 1: Relative to current file (for built version)
    path.join(__dirname, '../../../../package.json'),
    // Strategy 2: Relative to current file (for source version)
    path.join(__dirname, '../../../package.json'),
    // Strategy 3: Look for package.json in parent directories
    await findPackageJsonUpwardsAsync(__dirname),
  ].filter(Boolean) as string[];

  for (const packagePath of possiblePaths) {
    if (await fileExists(packagePath)) {
      try {
        const content = await readFile(packagePath, 'utf8');
        const packageJson = JSON.parse(content);
        // Verify this is the correct package
        if (packageJson.name === '@noanswer/context-compose') {
          return packageJson;
        }
      } catch {
        // Continue to next path if parsing fails
      }
    }
  }

  // Fallback: return default version if no package.json found
  return {
    version: '1.0.0',
    name: '@noanswer/context-compose',
    description: 'Context Compose CLI and MCP Server',
  };
}

/**
 * Synchronous version for backward compatibility
 */
export function findPackageJson(): PackageJson {
  // For CLI usage where we need synchronous access
  const { existsSync, readFileSync } = require('node:fs');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const possiblePaths = [
    path.join(__dirname, '../../../../package.json'),
    path.join(__dirname, '../../../package.json'),
    findPackageJsonUpwards(__dirname),
  ].filter(Boolean) as string[];

  for (const packagePath of possiblePaths) {
    if (existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        if (packageJson.name === '@noanswer/context-compose') {
          return packageJson;
        }
      } catch {
        // Continue to next path if parsing fails
      }
    }
  }

  return {
    version: '1.0.0',
    name: '@noanswer/context-compose',
    description: 'Context Compose CLI and MCP Server',
  };
}

/**
 * Find package.json by walking up the directory tree (async version)
 */
async function findPackageJsonUpwardsAsync(
  startDir: string
): Promise<string | null> {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packagePath = path.join(currentDir, 'package.json');
    if (await fileExists(packagePath)) {
      try {
        const content = await readFile(packagePath, 'utf8');
        const pkg = JSON.parse(content);
        // Check if this is the correct package
        if (pkg.name === '@noanswer/context-compose') {
          return packagePath;
        }
      } catch {
        // Continue searching if parsing fails
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Synchronous version for backward compatibility
 */
function findPackageJsonUpwards(startDir: string): string | null {
  const { existsSync, readFileSync } = require('node:fs');
  let currentDir = startDir;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packagePath = path.join(currentDir, 'package.json');
    if (existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
        if (pkg.name === '@noanswer/context-compose') {
          return packagePath;
        }
      } catch {
        // Continue searching if parsing fails
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Memoized version for better performance
 */
export const findPackageJsonMemoized = memoizeAsync(
  findPackageJsonAsync,
  () => 'package-json', // Single cache key since package.json doesn't change often
  30 * 60 * 1000 // 30 minutes cache
);
