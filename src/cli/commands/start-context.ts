import { Command } from 'commander';
import { executeStartContextTool } from '../../core/tools/start-context.js';
import type { StartContextToolInput } from '../../schemas/start-context.js';

/**
 * Create Start Context CLI command
 */
export function createStartContextCommand(): Command {
  const startContextCommand = new Command('start-context');

  startContextCommand
    .description(
      'Start a new context for a task. Reads <context-name>-context.yaml file from the assets directory. Combines prompts from all referenced files (personas, rules, mcps, actions).'
    )
    .argument('<contextName>', 'Context name (e.g., feature, api, test)')
    .option(
      '-e, --enhanced-prompt',
      'Use detailed enhanced prompt (default: simple prompt)'
    )
    .action(
      async (contextName: string, options: { enhancedPrompt?: boolean }) => {
        try {
          const input: StartContextToolInput = {
            contextName,
            projectRoot: process.cwd(), // Use current working directory in CLI
            enhancedPrompt: options.enhancedPrompt || true, // Default to enhanced
          };

          const result = await executeStartContextTool(input);

          if (result.success) {
            console.log(result.combinedPrompt);
            // This is where the next step would be initiated
            // For now, we just print the context.
          } else {
            console.error(result.message);
            process.exit(1);
          }
        } catch (error) {
          console.error(
            `❌ Error executing Start Context: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      }
    );

  return startContextCommand;
}
