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
      'Get context for a task. For contextId "default", reads assets/context-default.yaml file directly. For other contextIds, reads task-<context-id>.yaml file from the config directory. Combines prompts from all files in the jobs section (workflow, rules, mcps, notify, issue, and other custom sections).'
    )
    .argument('<contextId>', 'Context ID')
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .option(
      '-e, --enhanced-prompt',
      '상세한 enhanced prompt 사용 (기본값: 간단한 prompt)'
    )
    .action(
      async (
        contextId: string,
        options: { configPath: string; enhancedPrompt?: boolean }
      ) => {
        try {
          const input: GetContextToolInput = {
            contextId,
            projectRoot: process.cwd(), // CLI에서는 현재 작업 디렉토리 사용
            configPath: options.configPath,
            enhancedPrompt: options.enhancedPrompt || false,
          };

          const result = await executeGetContextTool(input);

          if (result.success) {
            console.log(result.message);
            const promptType = options.enhancedPrompt ? 'ENHANCED' : 'SIMPLE';
            console.log(`\n📋 Prompt Type: ${promptType}`);
            console.log('\n' + '='.repeat(80));
            console.log('COMBINED PROMPT');
            console.log('='.repeat(80));
            console.log(result.combinedPrompt);
            console.log('='.repeat(80));

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

/**
 * Get Context 명령어 사용 예시 출력
 */
export function showGetContextExamples(): void {
  console.log('\n📖 Get Context 사용 예시:');
  console.log('  task-action get-context context-default');
  console.log('  task-action get-context feature-context');
  console.log(
    '  task-action get-context test-context --config-path .taskaction'
  );
  console.log('  task-action get-context context-default --enhanced-prompt');
  console.log('  task-action get-context complex-context -e -c .taskaction');
}
