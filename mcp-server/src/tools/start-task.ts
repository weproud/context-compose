import { FastMCP } from 'fastmcp';
import { StartTaskToolSchema } from '../../../src/schemas/start-task.js';
import { executeStartTaskTool } from '../../../src/core/tools/start-task.js';
import logger from '../logger.js';

/**
 * Register Start Task tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerStartTaskTool(server: FastMCP): void {
  server.addTool({
    name: 'task_start',
    description:
      'Start a task. Reads task-<task-id>.yaml file and combines prompts from all files in the jobs section (workflow, rules, mcps, notify, issue, and other custom sections) to provide context for AI development. The projectRoot parameter must specify the project root directory. The enhancedPrompt option allows you to choose whether to use detailed guidelines.',
    parameters: StartTaskToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info(
          'Executing Start Task tool',
          args as Record<string, unknown>
        );

        // Use shared business logic
        const result = await executeStartTaskTool(args);

        logger.info('Start Task tool completed', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Error occurred while executing Start Task tool', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
