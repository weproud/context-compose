import { Command } from 'commander';
import { EnvLoader } from '../../core/env.js';

/**
 * 환경변수 명령 생성
 */
export function createEnvCommand(): Command {
  const envCommand = new Command('env');

  envCommand
    .description('환경변수 설정 상태를 확인합니다')
    .option('-c, --check', '메시징 서비스 설정 상태만 확인')
    .option('-s, --setup', '.env 파일 설정 가이드 표시')
    .action(async (options: { check?: boolean; setup?: boolean }) => {
      try {
        if (options.setup) {
          showEnvSetupGuide();
        } else if (options.check) {
          checkMessagingConfig();
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
    console.log('  $ mcp-tool env --check');
    console.log('  $ mcp-tool env --setup');
    console.log('');
    console.log('설명:');
    console.log('  이 명령은 .env 파일과 환경변수 설정 상태를 확인합니다.');
    console.log('  메시징 서비스(Slack, Discord) 설정을 확인할 수 있습니다.');
  });

  return envCommand;
}

/**
 * 메시징 설정 상태만 확인
 */
function checkMessagingConfig(): void {
  console.log('📤 메시징 서비스 설정 상태:');
  
  const config = EnvLoader.checkMessagingConfig();
  
  console.log('');
  console.log('Slack:');
  if (config.slack) {
    console.log('  ✅ 설정됨');
    console.log(`  📍 URL: ${config.slackUrl?.substring(0, 50)}...`);
  } else {
    console.log('  ❌ 미설정');
    console.log('  💡 SLACK_WEBHOOK_URL 환경변수를 설정해주세요.');
  }
  
  console.log('');
  console.log('Discord:');
  if (config.discord) {
    console.log('  ✅ 설정됨');
    console.log(`  📍 URL: ${config.discordUrl?.substring(0, 50)}...`);
  } else {
    console.log('  ❌ 미설정');
    console.log('  💡 DISCORD_WEBHOOK_URL 환경변수를 설정해주세요.');
  }
  
  console.log('');
  if (config.slack || config.discord) {
    console.log('🎉 메시징 서비스가 설정되었습니다!');
    console.log('');
    console.log('사용 방법:');
    if (config.slack) {
      console.log('  $ mcp-tool send-message-slack "Hello, Slack!"');
    }
    if (config.discord) {
      console.log('  $ mcp-tool send-message-discord "Hello, Discord!"');
    }
  } else {
    console.log('⚠️  메시징 서비스가 설정되지 않았습니다.');
    console.log('💡 --setup 옵션으로 설정 가이드를 확인하세요.');
  }
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
  console.log('# Slack Webhook URL');
  console.log('SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK');
  console.log('');
  console.log('# Discord Webhook URL');
  console.log('DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK');
  console.log('');
  console.log('3. Webhook URL 얻는 방법:');
  console.log('');
  console.log('📱 Slack:');
  console.log('  1. Slack 앱에서 Incoming Webhooks 활성화');
  console.log('  2. 채널 선택 후 Webhook URL 복사');
  console.log('  3. URL: https://api.slack.com/messaging/webhooks');
  console.log('');
  console.log('🎮 Discord:');
  console.log('  1. Discord 서버 설정 > Integrations > Webhooks');
  console.log('  2. New Webhook 생성 후 채널 선택');
  console.log('  3. Webhook URL 복사');
  console.log('');
  console.log('4. 설정 확인:');
  console.log('   $ mcp-tool env --check');
  console.log('');
  console.log('💡 .env.example 파일을 참고하여 다른 환경변수도 설정할 수 있습니다.');
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
  console.log('메시징 설정 확인:');
  console.log('  $ mcp-tool env --check');
  console.log('  → Slack, Discord 설정 상태만 확인');
  console.log('');
  console.log('설정 가이드:');
  console.log('  $ mcp-tool env --setup');
  console.log('  → .env 파일 설정 방법 안내');
  console.log('');
  console.log('환경변수 파일:');
  console.log('  📁 .env (실제 설정 파일)');
  console.log('  📁 .env.example (예시 파일)');
}
