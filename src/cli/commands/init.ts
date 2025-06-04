import { Command } from 'commander';
import { InitTool } from '../../core/tools/index.js';

/**
 * Init 명령을 위한 CLI 핸들러
 */
export function createInitCommand(): Command {
  const initCommand = new Command('init');

  initCommand
    .description(
      'Task Action 프로젝트를 초기화합니다 (assets 디렉토리를 .taskaction으로 복사)'
    )
    .option('-v, --verbose', '상세한 출력 표시')
    .action(async (options: { verbose?: boolean }) => {
      try {
        const { verbose = false } = options;

        if (verbose) {
          console.error(
            `[INFO] Init 명령 실행 시작 - 현재 디렉토리에 .taskaction 생성`
          );
        }

        // CLI에서는 현재 작업 디렉토리를 기본값으로 사용
        const result = await InitTool.execute(process.cwd());

        if (result.success) {
          console.log(result.message);

          if (verbose) {
            console.log('\n📁 설정 디렉토리: .taskaction');
            if (result.createdFiles.length > 0) {
              console.log('✅ 생성된 파일들:');
              result.createdFiles.forEach(file => console.log(`  - ${file}`));
            }
            if (result.skippedFiles.length > 0) {
              console.log('⏭️  건너뛴 파일들:');
              result.skippedFiles.forEach(file => console.log(`  - ${file}`));
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
            `[ERROR] Init 명령 실행 실패 ${JSON.stringify({ error: errorMessage })}`
          );
        }

        process.exit(1);
      }
    });

  return initCommand;
}

/**
 * Init 명령 예시 사용법 출력
 */
export function showInitExamples(): void {
  console.log('Init 명령 사용 예시:');
  console.log('  task-action init');
  console.log('  task-action init --verbose');
}
