import fs from 'node:fs';
import type { Command } from 'commander';
import inquirer from 'inquirer';
import { executeInitTool } from '../../core/tools/init.js';

async function confirmOverwrite(): Promise<boolean> {
  const { overwrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message:
        'A .contextcompose directory already exists. Do you want to overwrite it?',
      default: false,
    },
  ]);
  return overwrite;
}

/**
 * Initializes the project by creating a .contextcompose directory and necessary files.
 * @param program - The commander program instance.
 */
export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initializes the project configuration.')
    .action(async () => {
      try {
        if (fs.existsSync('.contextcompose')) {
          const overwrite = await confirmOverwrite();
          if (!overwrite) {
            console.info('Operation cancelled.');
            return;
          }
        }

        const result = await executeInitTool(process.cwd());
        if (result.success) {
          console.info(result.message);
        } else {
          console.error(`❌ ${result.message}`);
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
