import { Command } from 'commander';
import { ValidateTaskTool } from '../../core/tools/validate-task.js';

/**
 * Task 명령을 위한 CLI 핸들러 (validate 하위 명령 포함)
 */
export function createTaskCommand(): Command {
  const taskCommand = new Command('task');
  taskCommand.description('Task 관련 명령어들');

  // validate 하위 명령 추가
  const validateSubCommand = new Command('validate');
  validateSubCommand
    .description('Task 파일과 관련 파일들의 유효성을 검사합니다')
    .argument('<task-id>', 'Task ID')
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .action(async (taskId: string, options: { configPath?: string }) => {
      try {
        const { configPath = '.taskaction' } = options;

        console.log(`🔍 Task validation 시작: "${taskId}"`);

        const result = await ValidateTaskTool.executeFromParams(
          taskId,
          process.cwd(),
          configPath
        );

        // 결과 출력
        console.log(result.message);
        console.log('');

        // 요약 정보 출력
        const { summary } = result;
        console.log('📊 Validation 요약:');
        console.log(`  - 총 검사 항목: ${summary.total}`);
        console.log(`  - 통과: ${summary.passed}`);
        console.log(`  - 실패: ${summary.failed}`);
        console.log(`  - 경고: ${summary.warnings}`);

        if (summary.failed > 0 || summary.warnings > 0) {
          console.log('');
          console.log('📋 상세 결과:');

          // 카테고리별로 그룹화
          const groupedResults = result.validationResults.reduce(
            (acc, item) => {
              if (!acc[item.category]) {
                acc[item.category] = [];
              }
              acc[item.category]!.push(item);
              return acc;
            },
            {} as Record<string, typeof result.validationResults>
          );

          for (const [category, items] of Object.entries(groupedResults)) {
            console.log(`\n  ${category}:`);
            for (const item of items) {
              const icon =
                item.status === 'pass'
                  ? '✅'
                  : item.status === 'fail'
                    ? '❌'
                    : '⚠️';
              console.log(`    ${icon} ${item.item}: ${item.message}`);
            }
          }
        }

        if (!result.success) {
          process.exit(1);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ 오류: ${errorMessage}`);
        process.exit(1);
      }
    });

  // task 명령에 하위 명령들 추가
  taskCommand.addCommand(validateSubCommand);

  return taskCommand;
}

/**
 * Task 명령 예시 사용법 출력
 */
export function showTaskExamples(): void {
  console.log('📝 Task 명령 사용 예시:');
  console.log('');
  console.log('Task 검증:');
  console.log('  $ task-action task validate context-default');
  console.log('  $ task-action task validate my-feature-task');
  console.log('');
  console.log('주의사항:');
  console.log(
    '  - 먼저 task-action init 명령으로 프로젝트를 초기화해야 합니다'
  );
}
