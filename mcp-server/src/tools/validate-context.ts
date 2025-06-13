import type { FastMCP } from 'fastmcp';
import { executeValidateContextTool } from '../../../src/core/tools/validate-context.js';
import { ValidateContextToolSchema } from '../../../src/schemas/validate-context.js';
import logger from '../logger.js';

/**
 * Register Validate Context tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerValidateContextTool(server: FastMCP): void {
  server.addTool({
    name: 'validate-context',
    description: 'Validate a context file and its referenced component files.',
    parameters: ValidateContextToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info(
          'Executing Validate Context tool',
          args as Record<string, unknown>
        );

        const result = await executeValidateContextTool(args);

        logger.info('Validate Context tool completed', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Error occurred while executing Validate Context tool', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
