import { FastMCP } from 'fastmcp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { registerHelloMCPTools } from './tools/index.js';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  version: string;
  name?: string;
  description?: string;
}

/**
 * Main MCP server class that integrates with Task Action
 */
class TaskActionServer {
  private server: FastMCP;
  private initialized: boolean;

  constructor() {
    // Get version from package.json using synchronous fs
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson: PackageJson = JSON.parse(
      fs.readFileSync(packagePath, 'utf8')
    );

    // Create FastMCP server with proper options
    this.server = new FastMCP({
      name: 'Task Action Server',
      version: packageJson.version as `${number}.${number}.${number}`,
    });
    this.initialized = false;

    // Bind methods
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  /**
   * Initialize the MCP server with necessary tools and routes
   */
  async init(): Promise<TaskActionServer | undefined> {
    if (this.initialized) return;

    // Register all Task Action tools
    registerHelloMCPTools(this.server);

    this.initialized = true;
    return this;
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<TaskActionServer> {
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

export default TaskActionServer;
