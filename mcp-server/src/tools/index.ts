/**
 * tools/index.ts
 * Export all Hello MCP tools for MCP server
 */
import { FastMCP } from 'fastmcp';
import { registerInitTool } from './init.js';
import { registerGreetingTool } from './greeting.js';
import { registerSlackTool } from './slack.js';
import { registerDiscordTool } from './discord.js';
import logger from '../logger.js';

/**
 * Register all Hello MCP tools with the MCP server
 * @param server - FastMCP server instance
 */
export function registerHelloMCPTools(server: FastMCP): void {
  try {
    // Register each tool
    registerInitTool(server);
    registerGreetingTool(server);
    registerSlackTool(server);
    registerDiscordTool(server);

    logger.info('All Hello MCP tools registered successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error registering Hello MCP tools: ${errorMessage}`);
    throw error;
  }
}

export default {
  registerHelloMCPTools,
};
