import { Command } from 'commander';
import { initProject } from '../../core/tools/index.js';

/**
 * Init 명령을 위한 CLI 핸들러
 */
export function createInitCommand(): Command {
  const initCommand = new Command('init');

  initCommand
    .description(
      'Task Action 프로젝트를 초기화합니다 (assets 디렉토리를 .taskaction으로 복사)'
    )
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.taskaction')
    .option('-v, --verbose', '상세한 출력 표시')
    .action(async (options: { configPath?: string; verbose?: boolean }) => {
      try {
        const { configPath = '.taskaction', verbose = false } = options;

        if (verbose) {
          console.error(
            `[INFO] Init 명령 실행 시작 ${JSON.stringify({ configPath })}`
          );
        }

        const result = await initProject(configPath);

        if (result.success) {
          console.log(result.message);

          if (verbose) {
            console.log('\n📁 설정 디렉토리:', result.configPath);
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
  console.log('  task-action init --force');
  console.log('  task-action init --config-path ./my-config');
  console.log('  task-action init --force --config-path ./my-config --verbose');
}
