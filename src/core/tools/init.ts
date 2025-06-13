import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InitToolResponse } from '../../schemas/index.js';
import { InitToolSchema } from '../../schemas/index.js';
import { AssetsNotFoundError, InvalidProjectRootError } from '../errors.js';
import { backupDirectory, copyDirectory, fileExists } from '../utils/index.js';

/**
 * Common Init business logic.
 * Pure functions that can be used by both CLI and MCP server.
 */

/**
 * Finds the path to the assets directory.
 * It searches in multiple locations to support both development and installed package scenarios.
 * @returns A promise that resolves to the path of the assets directory, or null if not found.
 */
async function findAssetsDirectory(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Search upwards from the current file's directory
  let currentDir = __dirname;
  for (let i = 0; i < 10; i++) {
    const assetsPath = join(currentDir, 'assets');
    if (await fileExists(assetsPath)) {
      const packageJsonPath = join(currentDir, 'package.json');
      if (await fileExists(packageJsonPath)) {
        return assetsPath;
      }
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break; // Reached root
    currentDir = parentDir;
  }

  // As a fallback, try to resolve via require, which can find it in node_modules
  try {
    const packagePath = require.resolve(
      '@noanswer/context-compose/package.json'
    );
    const packageRoot = dirname(packagePath);
    const assetsPath = join(packageRoot, 'assets');
    if (await fileExists(assetsPath)) {
      return assetsPath;
    }
  } catch (_error) {
    //
  }

  throw new AssetsNotFoundError();
}

/**
 * Core logic for the Init tool.
 * @param projectRoot - The root directory of the project to initialize.
 * @returns A promise that resolves to an InitToolResponse.
 */
export async function executeInit(
  projectRoot: string
): Promise<InitToolResponse> {
  const createdFiles: string[] = [];
  let backupPath: string | null = null;

  try {
    if (!projectRoot || projectRoot === '/') {
      throw new InvalidProjectRootError(projectRoot);
    }

    const configDir = join(projectRoot, '.contextcompose');
    const assetsDir = await findAssetsDirectory();

    if (await fileExists(configDir)) {
      backupPath = await backupDirectory(configDir);
    }

    const copiedFiles = await copyDirectory(assetsDir, configDir);
    createdFiles.push(...copiedFiles);

    const message = `✅ Context Compose project initialized successfully.${
      backupPath ? `\n📦 Existing directory backed up to: ${backupPath}` : ''
    }`;

    return {
      success: true,
      message,
      createdFiles,
      skippedFiles: backupPath ? [configDir] : [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `❌ Context Compose project initialization failed: ${errorMessage}`,
      createdFiles,
      skippedFiles: [],
    };
  }
}

/**
 * Validates arguments and executes the Init tool.
 * This is the primary entry point for the MCP tool.
 * @param args - The arguments for the tool, matching InitToolSchema.
 * @returns A promise that resolves to an InitToolResponse.
 */
export async function executeInitTool(
  args: unknown
): Promise<InitToolResponse> {
  const validatedArgs = InitToolSchema.parse(args);
  return executeInit(validatedArgs.projectRoot);
}
