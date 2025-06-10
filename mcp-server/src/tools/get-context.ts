import type { FastMCP } from 'fastmcp';
import { executeGetContextTool } from '../../../src/core/tools/get-context.js';
import { GetContextToolSchema } from '../../../src/schemas/get-context.js';
import logger from '../logger.js';

/**
 * Register Get Context tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerGetContextTool(server: FastMCP): void {
  server.addTool({
    name: 'get-context',
    description:
      'Get context for a task. Reads <context-id>-context.yaml file from the .contextcompose directory. Combines prompts from all files in the jobs section (workflow, rules, mcps, notify, issue, and other custom sections) to provide context for AI development. The projectRoot parameter must specify the project root directory. The enhancedPrompt option allows you to choose whether to use detailed guidelines.',
    parameters: GetContextToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info(
          'Executing Get Context tool',
          args as Record<string, unknown>
        );

        // Use shared business logic
        const result = await executeGetContextTool(args);

        logger.info('Get Context tool completed', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Error occurred while executing Get Context tool', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
