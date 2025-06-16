import type { Command } from 'commander';
import { handleError, logError } from '../../core/errors.js';
import { executeStartContextTool } from '../../core/tools/start-context.js';

interface StartContextOptions {
  projectRoot?: string;
  enhancedPrompt?: boolean;
}

/**
 * Create Start Context CLI command
 */
export function registerStartContextCommand(program: Command) {
  program
    .command('start-context <context-name>')
    .description('Start a new context for a task.')
    .option('--project-root <path>', 'The root directory of the project.')
    .option('--enhanced-prompt', 'Use enhanced prompts.')
    .action(async (contextName: string, options: StartContextOptions) => {
      try {
        const result = await executeStartContextTool({
          contextName,
          projectRoot: options.projectRoot || process.cwd(),
          enhancedPrompt: options.enhancedPrompt,
        });

        if (result.success) {
          console.info(result.combinedPrompt);
        } else {
          console.error(`Error: ${result.message}`);
          process.exit(1);
        }
      } catch (error) {
        logError(error, {
          command: 'start-context',
          contextName,
          options,
        });
        const err = handleError(error);
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
