import { Command } from 'commander';
import { executeGetContextTool } from '../../core/tools/get-context.js';
import type { GetContextToolInput } from '../../schemas/get-context.js';

/**
 * Create Get Context CLI command
 */
export function createGetContextCommand(): Command {
  const getContextCommand = new Command('get-context');

  getContextCommand
    .description(
      'Get context for a task. Reads <context-id>-context.yaml file from the .contextcompose directory. Combines prompts from all files in the jobs section (workflow, rules, mcps, notify, issue, and other custom sections).'
    )
    .argument('<contextId>', 'Context ID')
    .option(
      '-e, --enhanced-prompt',
      'Use detailed enhanced prompt (default: simple prompt)'
    )
    .action(
      async (contextId: string, options: { enhancedPrompt?: boolean }) => {
        try {
          const input: GetContextToolInput = {
            contextId,
            projectRoot: process.cwd(), // Use current working directory in CLI
            enhancedPrompt: options.enhancedPrompt || false,
          };

          const result = await executeGetContextTool(input);

          if (result.success) {
            console.log(result.message);
            console.log(result.combinedPrompt);
          } else {
            console.error(result.message);
            process.exit(1);
          }
        } catch (error) {
          console.error(
            `❌ Error executing Get Context: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      }
    );

  return getContextCommand;
}
