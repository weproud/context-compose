import { Command } from 'commander';
import { executeStartTaskTool } from '../../core/tools/start-task.js';
import type { StartTaskToolInput } from '../../schemas/start-task.js';

/**
 * Start Task CLI 명령어 생성
 */
export function createStartTaskCommand(): Command {
  const command = new Command('start-task');

  command
    .description(
      'Task를 시작합니다. task-<task-id>.yaml 파일을 읽어서 workflow, rules, mcps 파일들의 prompt를 조합합니다.'
    )
    .argument('<taskId>', 'Task ID')
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .action(async (taskId: string, options: { configPath: string }) => {
      try {
        const input: StartTaskToolInput = {
          taskId,
          projectRoot: process.cwd(), // CLI에서는 현재 작업 디렉토리 사용
          configPath: options.configPath,
        };

        const result = await executeStartTaskTool(input);

        if (result.success) {
          console.log(result.message);
          console.log('\n' + '='.repeat(80));
          console.log('COMBINED PROMPT');
          console.log('='.repeat(80));
          console.log(result.combinedPrompt);
          console.log('='.repeat(80));

          if (result.files) {
            console.log('\n📁 참조된 파일들:');
            if (result.files.workflow) {
              console.log(`  - Workflow: ${result.files.workflow}`);
            }
            if (result.files.rules.length > 0) {
              console.log(`  - Rules: ${result.files.rules.join(', ')}`);
            }
            if (result.files.mcps.length > 0) {
              console.log(`  - MCPs: ${result.files.mcps.join(', ')}`);
            }
          }
        } else {
          console.error(result.message);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          `❌ Start Task 실행 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });

  return command;
}

/**
 * Start Task 명령어 사용 예시 출력
 */
export function showStartTaskExamples(): void {
  console.log('\n📖 Start Task 사용 예시:');
  console.log('  task-action start-task init');
  console.log('  task-action start-task my-feature-task');
  console.log(
    '  task-action start-task test-task-creation --config-path .taskaction'
  );
}
