import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { FileNotFoundError, YamlParseError } from '../errors.js';
import { fileExists } from './index.js';

/**
 * Read and parse a YAML file asynchronously.
 */
export async function readYamlFile<T>(filePath: string): Promise<T> {
  if (!(await fileExists(filePath))) {
    throw new FileNotFoundError(filePath);
  }
  try {
    const content = await readFile(filePath, 'utf8');
    return parseYaml(content) as T;
  } catch (error) {
    throw new YamlParseError(
      filePath,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
