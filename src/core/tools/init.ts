import { access, mkdir, readdir, stat, rename, copyFile } from 'fs/promises';
import { constants } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { InitToolSchema, type InitToolResponse } from '../../schemas/index.js';

/**
 * Common Init business logic
 * Pure functions that can be used by both CLI and MCP server
 */
export class InitTool {
  /**
   * Check if file exists
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Return current date and time in yyyyMMddHHmmss format
   */
  private static getCurrentTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Backup existing directory
   */
  private static async backupExistingDirectory(
    configDir: string
  ): Promise<string> {
    const timestamp = this.getCurrentTimestamp();
    const backupPath = `${configDir}-${timestamp}`;

    await rename(configDir, backupPath);
    return backupPath;
  }

  /**
   * Find assets directory path
   */
  private static async findAssetsDirectory(): Promise<string | null> {
    // Consider when MCP server is called from other projects
    // Find the assets directory of the task-action package

    // 1. Start from current file location and find task-action project's assets directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Go up to task-action project root while looking for assets directory
    let currentDir = __dirname;
    for (let i = 0; i < 10; i++) {
      // Go up maximum 10 levels
      const assetsPath = join(currentDir, 'assets');
      if (await this.fileExists(assetsPath)) {
        return assetsPath;
      }
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root directory
      currentDir = parentDir;
    }

    // 2. Find task-action package's assets directory in node_modules
    // (when task-action is installed as npm package in other projects)
    try {
      const nodeModulesPath = join(
        process.cwd(),
        'node_modules',
        'task-action',
        'assets'
      );
      if (await this.fileExists(nodeModulesPath)) {
        return nodeModulesPath;
      }
    } catch (error) {
      // Ignore if not found in node_modules
    }

    // 3. Try to find in global node_modules
    try {
      // Use require.resolve to find task-action package location
      const taskActionPath = require.resolve('task-action/package.json');
      const taskActionRoot = dirname(taskActionPath);
      const globalAssetsPath = join(taskActionRoot, 'assets');
      if (await this.fileExists(globalAssetsPath)) {
        return globalAssetsPath;
      }
    } catch (error) {
      // Ignore if require.resolve fails
    }

    return null;
  }

  /**
   * Copy directory recursively
   */
  private static async copyDirectory(
    src: string,
    dest: string
  ): Promise<string[]> {
    const copiedFiles: string[] = [];

    try {
      // Create destination directory
      await mkdir(dest, { recursive: true });
      copiedFiles.push(dest);

      // Read all entries in source directory
      const entries = await readdir(src);

      for (const entry of entries) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);

        const stats = await stat(srcPath);

        if (stats.isDirectory()) {
          // Recursively copy subdirectory
          const subFiles = await this.copyDirectory(srcPath, destPath);
          copiedFiles.push(...subFiles);
        } else {
          // Copy file
          await copyFile(srcPath, destPath);
          copiedFiles.push(destPath);
        }
      }
    } catch (error) {
      throw new Error(
        `Directory copy failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return copiedFiles;
  }

  /**
   * Task Action project initialization core logic
   */
  static async execute(projectRoot?: string): Promise<InitToolResponse> {
    const createdFiles: string[] = [];
    const skippedFiles: string[] = [];
    let backupPath: string | null = null;

    try {
      // Determine target directory (passed as parameter or current working directory)
      let baseDir: string;
      if (projectRoot) {
        baseDir = projectRoot;
        console.log(`[DEBUG] User-specified projectRoot: "${baseDir}"`);
      } else {
        baseDir = process.cwd();
        console.log(`[DEBUG] process.cwd(): "${baseDir}"`);

        // Handle case when process.cwd() is empty string or invalid
        if (!baseDir || baseDir === '/') {
          throw new Error(
            'process.cwd() is invalid. ' +
              'Make sure MCP server is running in correct working directory or ' +
              'explicitly provide projectRoot parameter. ' +
              `Current value: "${baseDir}"`
          );
        }
      }

      const configDir = join(baseDir, '.taskaction');
      console.log(`[DEBUG] configDir: "${configDir}"`);

      // Find assets directory
      const assetsDir = await this.findAssetsDirectory();
      if (!assetsDir) {
        throw new Error(
          'Cannot find task-action assets directory. ' +
            'Please verify that task-action is properly installed. ' +
            'Checked the following locations:\n' +
            '1. Current project assets directory\n' +
            '2. node_modules/task-action/assets\n' +
            '3. Globally installed task-action package assets directory'
        );
      }

      // .taskaction 디렉토리가 이미 존재하는지 확인
      const dirExists = await this.fileExists(configDir);
      if (dirExists) {
        // 기존 디렉토리를 백업
        backupPath = await this.backupExistingDirectory(configDir);
        skippedFiles.push(configDir);
      }

      // assets 디렉토리를 .taskaction으로 복사
      const copiedFiles = await this.copyDirectory(assetsDir, configDir);
      createdFiles.push(...copiedFiles);

      const message = this.generateSuccessMessage(
        createdFiles,
        skippedFiles,
        backupPath
      );

      return {
        success: true,
        message,
        createdFiles,
        skippedFiles,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Task Action project initialization failed: ${errorMessage}`,
        createdFiles,
        skippedFiles,
      };
    }
  }

  /**
   * Generate success message
   */
  private static generateSuccessMessage(
    createdFiles: string[],
    skippedFiles: string[],
    backupPath: string | null
  ): string {
    const messages: string[] = [];

    if (createdFiles.length > 0) {
      messages.push(
        `✅ Task Action project has been successfully initialized!`
      );
      // messages.push(`assets directory has been copied to .taskaction.`);
      // messages.push(`Created files/directories: ${createdFiles.length}`);
      // // Limit display to avoid showing too many files
      // const displayFiles = createdFiles.slice(0, 10);
      // displayFiles.forEach(file => {
      //   messages.push(`  - ${file}`);
      // });
      // if (createdFiles.length > 10) {
      //   messages.push(`  ... and ${createdFiles.length - 10} more`);
      // }
    }

    if (backupPath) {
      messages.push(`📦 Existing directory has been backed up: ${backupPath}`);
    }

    if (skippedFiles.length > 0 && !backupPath) {
      messages.push(`⚠️  Already existing directories: ${skippedFiles.length}`);
      skippedFiles.forEach(file => {
        messages.push(`  - ${file}`);
      });
    }

    return messages.join('\n');
  }

  /**
   * Input validation and execution
   */
  static async executeWithValidation(args: unknown): Promise<InitToolResponse> {
    // Validate input with Zod schema
    const validatedArgs = InitToolSchema.parse(args);

    // Execute business logic
    return this.execute(validatedArgs.projectRoot);
  }

  /**
   * Helper function for CLI - direct parameter passing
   */
  static async executeFromParams(): Promise<InitToolResponse> {
    return this.execute();
  }
}

/**
 * Simple functional interface (optional)
 */
export async function initProject(): Promise<InitToolResponse> {
  return InitTool.executeFromParams();
}

/**
 * Helper function for MCP tools
 */
export async function executeInitTool(
  args: unknown
): Promise<InitToolResponse> {
  return InitTool.executeWithValidation(args);
}
