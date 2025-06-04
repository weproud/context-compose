import { Command } from 'commander';
import { AddTaskTool } from '../../core/tools/index.js';

/**
 * Add Task 명령을 위한 CLI 핸들러
 */
export function createAddTaskCommand(): Command {
  const addTaskCommand = new Command('add');

  // task 하위 명령 추가
  const taskSubCommand = new Command('task');
  
  taskSubCommand
    .description('새로운 Task 파일을 생성합니다')
    .argument('<task-id>', 'Task ID (예: "create user controller")')
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .option('-v, --verbose', '상세한 출력 표시')
    .action(async (taskId: string, options: { configPath?: string; verbose?: boolean }) => {
      try {
        const { configPath = '.taskaction', verbose = false } = options;

        if (verbose) {
          console.error(
            `[INFO] Add Task 명령 실행 시작 ${JSON.stringify({ taskId, configPath })}`
          );
        }

        console.log(`📝 Task 파일 생성 중: "${taskId}"`);

        const result = await AddTaskTool.executeFromParams(taskId, configPath);

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
            `[ERROR] Add Task 명령 실행 실패 ${JSON.stringify({ error: errorMessage })}`
          );
        }

        process.exit(1);
      }
    });

  // add 명령에 task 하위 명령 추가
  addTaskCommand.addCommand(taskSubCommand);

  return addTaskCommand;
}

/**
 * Add Task 명령 예시 사용법 출력
 */
export function showAddTaskExamples(): void {
  console.log('📝 Add Task 명령 사용 예시:');
  console.log('');
  console.log('기본 사용법:');
  console.log('  $ task-action add task "create user controller"');
  console.log('  → task-create-user-controller.yaml 파일 생성');
  console.log('');
  console.log('다양한 Task ID:');
  console.log('  $ task-action add task "setup database"');
  console.log('  → task-setup-database.yaml 파일 생성');
  console.log('');
  console.log('  $ task-action add task "implement authentication"');
  console.log('  → task-implement-authentication.yaml 파일 생성');
  console.log('');
  console.log('  $ task-action add task "fix login bug"');
  console.log('  → task-fix-login-bug.yaml 파일 생성');
  console.log('');
  console.log('옵션 사용:');
  console.log('  $ task-action add task "new feature" --config-path ./my-config');
  console.log('  $ task-action add task "new feature" --verbose');
  console.log('');
  console.log('주의사항:');
  console.log('  - 먼저 task-action init 명령으로 프로젝트를 초기화해야 합니다');
  console.log('  - .taskaction/task-template.yaml 파일이 템플릿으로 사용됩니다');
  console.log('  - Task ID의 공백은 자동으로 하이픈(-)으로 변환됩니다');
}
