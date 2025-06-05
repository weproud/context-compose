import { Command } from 'commander';
import { executeStartTaskTool } from '../../core/tools/start-task.js';
import type { StartTaskToolInput } from '../../schemas/start-task.js';

/**
 * Create Task Start CLI command
 */
export function createStartTaskCommand(): Command {
  const taskCommand = new Command('task');

  // Add start subcommand
  const startSubCommand = new Command('start');

  startSubCommand
    .description(
      'Start a task. Reads task-<task-id>.yaml file and combines prompts from all files in the jobs section (workflow, rules, mcps, notify, issue, and other custom sections).'
    )
    .argument('<taskId>', 'Task ID')
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .option(
      '-e, --enhanced-prompt',
      '상세한 enhanced prompt 사용 (기본값: 간단한 prompt)'
    )
    .action(
      async (
        taskId: string,
        options: { configPath: string; enhancedPrompt?: boolean }
      ) => {
        try {
          const input: StartTaskToolInput = {
            taskId,
            projectRoot: process.cwd(), // CLI에서는 현재 작업 디렉토리 사용
            configPath: options.configPath,
            enhancedPrompt: options.enhancedPrompt || false,
          };

          const result = await executeStartTaskTool(input);

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
            `❌ Task Start 실행 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      }
    );

  // task 명령에 start 하위 명령 추가
  taskCommand.addCommand(startSubCommand);

  return taskCommand;
}

/**
 * Task Start 명령어 사용 예시 출력
 */
export function showStartTaskExamples(): void {
  console.log('\n📖 Task Start 사용 예시:');
  console.log('  task-action task start init');
  console.log('  task-action task start my-feature-task');
  console.log(
    '  task-action task start test-task-creation --config-path .taskaction'
  );
  console.log('  task-action task start my-task --enhanced-prompt');
  console.log('  task-action task start complex-task -e -c .taskaction');
}
