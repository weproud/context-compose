import { Command } from 'commander';
import { executeValidateContextTool } from '../../core/tools/validate-context.js';
import type { ValidateContextToolInput } from '../../schemas/validate-context.js';

/**
 * Creates the CLI command for validating a context.
 */
export function createValidateContextCommand(): Command {
  const command = new Command('validate');

  command
    .description('Validate a context file and its referenced component files.')
    .argument('<contextName>', 'Context name to validate (e.g., feature, api)')
    .action(async (contextName: string) => {
      try {
        const input: ValidateContextToolInput = {
          contextName,
          projectRoot: process.cwd(),
        };

        const result = await executeValidateContextTool(input);

        console.log(result.message);

        if (!result.success && result.errors.length > 0) {
          console.log('\nValidation Errors:');
          result.errors.forEach((error) => {
            console.error(`- File: ${error.filePath}`);
            console.error(`  Error: ${error.message}\n`);
          });
          process.exit(1);
        }
      } catch (error) {
        console.error(
          `❌ Error executing Validate Context: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        process.exit(1);
      }
    });

  return command;
}
