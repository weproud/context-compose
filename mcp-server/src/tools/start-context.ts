import type { FastMCP } from 'fastmcp';
import { executeStartContextTool } from '../../../src/core/tools/start-context.js';
import { StartContextToolSchema } from '../../../src/schemas/start-context.js';
import logger from '../logger';

/**
 * Register Start Context tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerStartContextTool(server: FastMCP): void {
  server.addTool({
    name: 'start-context',
    description:
      'Start a new context for a task. Reads <context-name>-context.yaml file from the assets directory. Combines prompts from all referenced files (personas, rules, mcps, actions) to provide context for AI development.',
    parameters: StartContextToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info(
          'Executing Start Context tool',
          args as Record<string, unknown>
        );

        // Use shared business logic
        const result = await executeStartContextTool(args);

        logger.info('Start Context tool completed', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Error occurred while executing Start Context tool', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
