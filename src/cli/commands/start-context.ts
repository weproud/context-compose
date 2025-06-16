import type { Command } from 'commander';
import { ErrorHandler } from '../../core/errors.js';
import { executeStartContextTool } from '../../core/tools/start-context.js';

/**
 * Create Start Context CLI command
 */
export function startContextCommand(program: Command): void {
  program
    .command('start')
    .description('Starts a new context from a persona.')
    .argument('<persona>', 'The name of the persona to use.')
    .action(async (persona: string) => {
      try {
        const input = { personaName: persona };
        const result = await executeStartContextTool(input);
        if (result.success) {
          console.info(result.combinedPrompt);
          // This is where the next step would be initiated
          // For now, we just print the context.
        } else {
          console.error(`Error: ${result.message}`);
          process.exit(1);
        }
      } catch (error) {
        ErrorHandler.logError(error, {
          command: 'start',
          persona,
          cwd: process.cwd(),
        });
        const errorInfo = ErrorHandler.handleError(error);
        console.error(`❌ ${errorInfo.message}`);
        process.exit(errorInfo.statusCode >= 500 ? 1 : 0);
      }
    });
}
