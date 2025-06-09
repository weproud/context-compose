/**
 * tools/index.ts
 * Export all Hello MCP tools for MCP server
 */
import { FastMCP } from 'fastmcp';
import logger from '../logger.js';
import { registerAddTaskTool } from './add-task.js';
import { registerInitTool } from './init.js';
import { registerStartTaskTool } from './start-task.js';

/**
 * Register all Hello MCP tools with the MCP server
 * @param server - FastMCP server instance
 */
export function registerMCPTools(server: FastMCP): void {
  try {
    // Register each tool
    registerInitTool(server);
    registerAddTaskTool(server);
    registerStartTaskTool(server);

    logger.info('All Hello MCP tools registered successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error registering Hello MCP tools: ${errorMessage}`);
    throw error;
  }
}

export default {
  registerHelloMCPTools: registerMCPTools,
};
