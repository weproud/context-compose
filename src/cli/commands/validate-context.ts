import type { Command } from 'commander';
import { handleError, logError } from '../../core/errors.js';
import { executeValidateContextTool } from '../../core/tools/validate-context.js';
import type { ValidateContextToolInput } from '../../schemas/validate-context.js';

/**
 * Creates the CLI command for validating a context.
 */
export function validateContextCommand(program: Command): void {
  program
    .command('validate')
    .description('Validates all asset files.')
    .action(async () => {
      try {
        const input: ValidateContextToolInput = {
          projectRoot: process.cwd(), // Use current working directory
        };
        const result = await executeValidateContextTool(input);

        console.info(result.message);

        if (!result.success && result.errors.length > 0) {
          console.info('\nValidation Errors:');
          for (const error of result.errors) {
            console.error(`- File: ${error.filePath}`);
            if (error.details) {
              console.error(`  Details: ${error.details}`);
            }
          }
          process.exit(1);
        }
      } catch (error) {
        logError(error, {
          command: 'validate',
          cwd: process.cwd(),
        });
        const errorInfo = handleError(error);
        console.error(`❌ ${errorInfo.message}`);
        process.exit(errorInfo.statusCode >= 500 ? 1 : 0);
      }
    });
}
