import { Command } from 'commander';
import { AddTaskTool } from '../../core/tools/index.js';
import { executeStartTaskTool } from '../../core/tools/start-task.js';
import type { StartTaskToolInput } from '../../schemas/start-task.js';

/**
 * Task 명령을 위한 CLI 핸들러 (add, start 하위 명령 포함)
 */
export function createTaskCommand(): Command {
  const taskCommand = new Command('task');
  taskCommand.description('Task 관련 명령어들');

  // add 하위 명령 추가
  const addSubCommand = new Command('add');
  addSubCommand
    .description('새로운 Task 파일을 생성합니다')
    .argument('<task-id>', 'Task ID (예: "create user controller")')
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .option('-v, --verbose', '상세한 출력 표시')
    .action(
      async (
        taskId: string,
        options: { configPath?: string; verbose?: boolean }
      ) => {
        try {
          const { configPath = '.taskaction', verbose = false } = options;

          if (verbose) {
            console.error(
              `[INFO] Task Add 명령 실행 시작 ${JSON.stringify({ taskId, configPath })}`
            );
          }

          console.log(`📝 Task 파일 생성 중: "${taskId}"`);

          const result = await AddTaskTool.executeFromParams(
            taskId,
            process.cwd(),
            configPath
          );

          if (result.success) {
            console.log(result.message);

            if (verbose) {
              console.log('\n📁 생성된 파일 정보:');
              console.log(`  - Task ID: ${result.taskId}`);
              console.log(`  - 파일명: ${result.fileName}`);
              if (result.filePath) {
                console.log(`  - 파일 경로: ${result.filePath}`);
              }
            }
          } else {
            console.error(`❌ ${result.message}`);
            process.exit(1);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`❌ 오류: ${errorMessage}`);

          if (options.verbose) {
            console.error(
              `[ERROR] Task Add 명령 실행 실패 ${JSON.stringify({ error: errorMessage })}`
            );
          }

          process.exit(1);
        }
      }
    );

  // start 하위 명령 추가
  const startSubCommand = new Command('start');
  startSubCommand
    .description(
      'Task를 시작합니다. task-<task-id>.yaml 파일을 읽어서 jobs 섹션의 모든 파일들(workflow, rules, mcps, notify, issue 등 커스텀 섹션 포함)의 prompt를 조합합니다.'
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

  // task 명령에 하위 명령들 추가
  taskCommand.addCommand(addSubCommand);
  taskCommand.addCommand(startSubCommand);

  return taskCommand;
}

/**
 * Task 명령 예시 사용법 출력
 */
export function showTaskExamples(): void {
  console.log('📝 Task 명령 사용 예시:');
  console.log('');
  console.log('Task 추가:');
  console.log('  $ task-action task add "create user controller"');
  console.log('  → task-create-user-controller.yaml 파일 생성');
  console.log('');
  console.log('  $ task-action task add "setup database"');
  console.log('  → task-setup-database.yaml 파일 생성');
  console.log('');
  console.log('Task 시작:');
  console.log('  $ task-action task start init');
  console.log('  $ task-action task start my-feature-task');
  console.log('  $ task-action task start my-task --enhanced-prompt');
  console.log('');
  console.log('옵션 사용:');
  console.log('  $ task-action task add "new feature" --config-path ./my-config');
  console.log('  $ task-action task add "new feature" --verbose');
  console.log('  $ task-action task start complex-task -e -c .taskaction');
  console.log('');
  console.log('주의사항:');
  console.log('  - 먼저 task-action init 명령으로 프로젝트를 초기화해야 합니다');
  console.log('  - .taskaction/task-template.yaml 파일이 템플릿으로 사용됩니다');
  console.log('  - Task ID의 공백은 자동으로 하이픈(-)으로 변환됩니다');
}
