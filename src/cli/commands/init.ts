import { Command } from 'commander';
import { InitTool } from '../../core/tools/index.js';

/**
 * CLI handler for Init command
 */
export function createInitCommand(): Command {
  const initCommand = new Command('init');

  initCommand
    .description(
      'Initialize Task Action project (copy assets directory to .taskaction)'
    )
    .action(async () => {
      try {
        // Use current working directory as default in CLI
        const result = await InitTool.execute(process.cwd());

        if (result.success) {
          console.log(result.message);
        } else {
          console.error(`❌ ${result.message}`);
          process.exit(1);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Error: ${errorMessage}`);
        process.exit(1);
      }
    });

  return initCommand;
}
