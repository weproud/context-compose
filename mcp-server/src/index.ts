import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FastMCP } from 'fastmcp';
import { registerAllTools } from './tools/index.js';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  version: string;
  name?: string;
  description?: string;
}

/**
 * Main MCP server class that integrates with Context Compose
 */
class ContextComposeServer {
  private server: FastMCP;
  private initialized: boolean;

  constructor() {
    // Get version from package.json using a more robust path resolution
    const packageJson: PackageJson = this.findPackageJson();

    // Create FastMCP server with proper options
    this.server = new FastMCP({
      name: 'Context Compose Server',
      version: packageJson.version as `${number}.${number}.${number}`,
    });
    this.initialized = false;

    // Bind methods
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  /**
   * Find package.json file using multiple strategies
   */
  private findPackageJson(): PackageJson {
    const possiblePaths = [
      // Strategy 1: Relative to current file (for built version)
      path.join(__dirname, '../../../package.json'),
      // Strategy 2: Relative to current file (for source version)
      path.join(__dirname, '../../package.json'),
      // Strategy 3: Look for package.json in parent directories
      this.findPackageJsonUpwards(__dirname),
    ].filter(Boolean) as string[];

    for (const packagePath of possiblePaths) {
      if (existsSync(packagePath)) {
        try {
          return JSON.parse(readFileSync(packagePath, 'utf8'));
        } catch {
          // Continue to next path if parsing fails
        }
      }
    }

    // Fallback: return default version if no package.json found
    return {
      version: '1.0.0',
      name: '@noanswer/context-compose',
      description: 'Context Compose MCP Server',
    };
  }

  /**
   * Find package.json by walking up the directory tree
   */
  private findPackageJsonUpwards(startDir: string): string | null {
    let currentDir = startDir;
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const packagePath = path.join(currentDir, 'package.json');
      if (existsSync(packagePath)) {
        try {
          const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
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
   * Initialize the MCP server with necessary tools and routes
   */
  async init(): Promise<ContextComposeServer | undefined> {
    if (this.initialized) return;

    // Register all Context Compose tools
    registerAllTools(this.server);

    this.initialized = true;
    return this;
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<ContextComposeServer> {
    if (!this.initialized) {
      await this.init();
    }

    // Start the FastMCP server
    await this.server.start({
      transportType: 'stdio',
    });

    return this;
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (this.server) {
      await this.server.stop();
    }
  }
}

export default ContextComposeServer;
