import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { FileNotFoundError, YamlParseError } from '../errors.js';
import { yamlCache } from './cache.js';
import { fileExists } from './index.js';

/**
 * Read and parse a YAML file asynchronously with caching.
 */
export async function readYamlFile<T>(filePath: string): Promise<T> {
  // Check cache first
  const cacheKey = `yaml:${filePath}`;
  const cached = await yamlCache.get(cacheKey, filePath);
  if (cached !== undefined) {
    return cached as T;
  }

  if (!(await fileExists(filePath))) {
    throw new FileNotFoundError(filePath);
  }

  try {
    const content = await readFile(filePath, 'utf8');
    const parsed = parseYaml(content) as T;

    // Cache the parsed result
    await yamlCache.set(cacheKey, parsed, filePath);

    return parsed;
  } catch (error) {
    throw new YamlParseError(
      filePath,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Read and parse multiple YAML files in parallel with caching.
 */
export async function readYamlFiles<T>(filePaths: string[]): Promise<T[]> {
  const promises = filePaths.map((filePath) => readYamlFile<T>(filePath));
  return Promise.all(promises);
}

/**
 * Preload YAML files into cache
 */
export async function preloadYamlFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await readYamlFile(filePath);
      } catch {
        // Ignore errors during preloading
      }
    })
  );
}
