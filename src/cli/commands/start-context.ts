import type { Command } from 'commander';
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
        if (error instanceof Error) {
          console.error(`An unexpected error occurred: ${error.message}`);
        } else {
          console.error('An unexpected error occurred.');
        }
        process.exit(1);
      }
    });
}
