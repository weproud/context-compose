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
      'Get context for a task. Reads <context-id>-context.yaml file from the .taskaction directory. Combines prompts from all files in the jobs section (workflow, rules, mcps, notify, issue, and other custom sections).'
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

            // 참조된 파일들 표시
            if (result.files) {
              console.log('\n📁 참조된 파일들:');
              const filesList: string[] = [];

              if (result.files.workflow) {
                filesList.push(`Workflow: ${result.files.workflow}`);
              }

              if (result.files.rules && result.files.rules.length > 0) {
                filesList.push(`Rules: ${result.files.rules.join(', ')}`);
              }

              if (result.files.mcps && result.files.mcps.length > 0) {
                filesList.push(`MCPs: ${result.files.mcps.join(', ')}`);
              }

              // 기타 동적 섹션들 처리
              Object.entries(result.files).forEach(([key, value]) => {
                if (
                  key !== 'workflow' &&
                  key !== 'rules' &&
                  key !== 'mcps' &&
                  value
                ) {
                  if (Array.isArray(value)) {
                    filesList.push(`${key}: ${value.join(', ')}`);
                  } else {
                    filesList.push(`${key}: ${value}`);
                  }
                }
              });

              if (filesList.length > 0) {
                console.log(`  - ${filesList.join('\n  - ')}`);
              }
            }
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
