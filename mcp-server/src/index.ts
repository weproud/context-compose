import { FastMCP } from 'fastmcp';
import { findPackageJson } from '../../src/core/utils/index.js';
import { registerAllTools } from './tools/index.js';

/**
 * Main MCP server class that integrates with Context Compose
 */
class ContextComposeServer {
  private server: FastMCP;
  private initialized: boolean;

  constructor() {
    // Get version from package.json using shared utility
    const packageJson = findPackageJson();

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
