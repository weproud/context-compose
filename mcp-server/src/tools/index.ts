/**
 * tools/index.ts
 * Export all Hello MCP tools for MCP server
 */
import type { FastMCP } from 'fastmcp';
import logger from '../logger.js';

import { registerInitTool } from './init.js';
import { registerStartContextTool } from './start-context.js';
import { registerValidateContextTool } from './validate-context.js';

/**
 * Register all Hello MCP tools with the MCP server
 * @param server - FastMCP server instance
 */
export function registerAllTools(server: FastMCP): void {
  try {
    // Register each tool
    registerInitTool(server);
    registerStartContextTool(server);
    registerValidateContextTool(server);

    logger.info('All Context-Compose MCP tools registered successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Error registering Context-Compose MCP tools: ${errorMessage}`
    );
    throw error;
  }
}

export default {
  registerHelloMCPTools: registerAllTools,
};
