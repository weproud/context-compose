import { Command } from 'commander';
import { EnvLoader } from '../../core/env.js';

/**
 * 환경변수 명령 생성
 */
export function createEnvCommand(): Command {
  const envCommand = new Command('env');

  envCommand
    .description('환경변수 설정 상태를 확인합니다')
    .option('-s, --setup', '.env 파일 설정 가이드 표시')
    .action(async (options: { setup?: boolean }) => {
      try {
        if (options.setup) {
          showEnvSetupGuide();
        } else {
          // 전체 환경변수 상태 표시
          EnvLoader.printStatus();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ 환경변수 확인 중 오류 발생: ${errorMessage}`);
        process.exit(1);
      }
    });

  // 도움말 개선
  envCommand.on('--help', () => {
    console.log('');
    console.log('사용 예시:');
    console.log('  $ mcp-tool env');
    console.log('  $ mcp-tool env --setup');
    console.log('');
    console.log('설명:');
    console.log('  이 명령은 .env 파일과 환경변수 설정 상태를 확인합니다.');
  });

  return envCommand;
}

/**
 * .env 파일 설정 가이드 표시
 */
function showEnvSetupGuide(): void {
  console.log('🔧 .env 파일 설정 가이드');
  console.log('');
  console.log('1. 프로젝트 루트에 .env 파일을 생성하세요:');
  console.log('   $ touch .env');
  console.log('');
  console.log('2. .env 파일에 다음 내용을 추가하세요:');
  console.log('');
  console.log('# OpenWeather API Key');
  console.log('OPENWEATHER_API_KEY=your_api_key_here');
  console.log('');
  console.log('# GitHub Token');
  console.log('GITHUB_TOKEN=your_github_token_here');
  console.log('');
  console.log('3. 설정 확인:');
  console.log('   $ mcp-tool env');
  console.log('');
  console.log(
    '💡 .env.example 파일을 참고하여 다른 환경변수도 설정할 수 있습니다.'
  );
}

/**
 * 환경변수 명령 사용 예시 표시
 */
export function showEnvExamples(): void {
  console.log('🔧 환경변수 명령 사용 예시:');
  console.log('');
  console.log('기본 사용법:');
  console.log('  $ mcp-tool env');
  console.log('  → 전체 환경변수 상태 확인');
  console.log('');
  console.log('설정 가이드:');
  console.log('  $ mcp-tool env --setup');
  console.log('  → .env 파일 설정 방법 안내');
  console.log('');
  console.log('환경변수 파일:');
  console.log('  📁 .env (실제 설정 파일)');
  console.log('  📁 .env.example (예시 파일)');
}
