import { FastMCP } from 'fastmcp';
import logger from '../logger.js';
import { executeTaskStatusTool } from '../../../src/core/tools/task-status.js';
import { TaskStatusToolSchema } from '../../../src/schemas/task-status.js';

/**
 * Register Task Status tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerTaskStatusTool(server: FastMCP): void {
  server.addTool({
    name: 'task_status',
    description:
      'Update task status (todo, ready, in-progress, done). Updates status in individual task files. The projectRoot parameter must specify the project root directory.',
    parameters: TaskStatusToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info(
          'Executing Task Status tool',
          args as Record<string, unknown>
        );

        // Use shared business logic
        const result = await executeTaskStatusTool(args);

        logger.info('Task Status tool completed', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Error occurred while executing Task Status tool', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
