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
      '상세한 enhanced prompt 사용 (기본값: 간단한 prompt)'
    )
    .action(
      async (contextId: string, options: { enhancedPrompt?: boolean }) => {
        try {
          const input: GetContextToolInput = {
            contextId,
            projectRoot: process.cwd(), // CLI에서는 현재 작업 디렉토리 사용
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
            `❌ Get Context 실행 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      }
    );

  return getContextCommand;
}
