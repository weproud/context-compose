import type { FastMCP } from 'fastmcp';
import { executeInitTool } from '../../../src/core/tools/init.js';
import { InitToolSchema } from '../../../src/schemas/init.js';
import logger from '../logger.js';

/**
 * Register Init tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerInitTool(server: FastMCP): void {
  server.addTool({
    name: 'init',
    description:
      'Initialize Context Compose project (copy assets directory to .contextcompose). You must specify the project root directory with the projectRoot parameter.',
    parameters: InitToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info('Executing Init tool', args as Record<string, unknown>);

        // Use common business logic
        const result = await executeInitTool(args);

        logger.info('Init tool completed', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Error executing Init tool', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
