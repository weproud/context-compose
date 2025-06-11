import { Command } from 'commander';
import { EnvLoader } from '../../core/env.js';

/**
 * Create environment variable command
 */
export function createEnvCommand(): Command {
  const envCommand = new Command('env');

  envCommand
    .description('Check environment variable configuration status')
    .option('-s, --setup', 'Show .env file setup guide')
    .action(async (options: { setup?: boolean }) => {
      try {
        if (options.setup) {
          showEnvSetupGuide();
        } else {
          // Display overall environment variable status
          EnvLoader.printStatus();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Error checking environment variables: ${errorMessage}`
        );
        process.exit(1);
      }
    });

  // Improve help
  envCommand.on('--help', () => {
    console.log('');
    console.log('Usage examples:');
    console.log('  $ mcp-tool env');
    console.log('  $ mcp-tool env --setup');
    console.log('');
    console.log('Description:');
    console.log(
      '  This command checks .env file and environment variable configuration status.'
    );
  });

  return envCommand;
}

/**
 * Show .env file setup guide
 */
function showEnvSetupGuide(): void {
  console.log('🔧 .env File Setup Guide');
  console.log('');
  console.log('1. Create .env file in project root:');
  console.log('   $ touch .env');
  console.log('');
  console.log('2. Add the following content to .env file:');
  console.log('');
  console.log('# OpenWeather API Key');
  console.log('OPENWEATHER_API_KEY=your_api_key_here');
  console.log('');
  console.log('# GitHub Token');
  console.log('GITHUB_TOKEN=your_github_token_here');
  console.log('');
  console.log('3. Verify configuration:');
  console.log('   $ mcp-tool env');
  console.log('');
  console.log(
    '💡 You can set other environment variables by referring to .env.example file.'
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
