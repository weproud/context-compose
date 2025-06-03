import { Command } from 'commander';
import { SlackTool } from '../../core/tools/slack.js';

/**
 * Slack 명령 생성
 */
export function createSlackCommand(): Command {
  const slackCommand = new Command('send-message-slack');

  slackCommand
    .description('Slack으로 메시지를 전송합니다')
    .argument('<message>', 'Slack으로 전송할 메시지')
    .action(async (message: string) => {
      try {
        console.log(`📤 Slack 메시지 전송 중...`);

        const result = await SlackTool.executeFromParams(message);

        if (result.success) {
          console.log(result.message);
          console.log('📋 전송된 메시지 정보:');
          console.log(`  - 메시지: "${result.sentMessage.text}"`);
        } else {
          console.error(`❌ ${result.message}`);
          process.exit(1);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Slack 메시지 전송 중 오류 발생: ${errorMessage}`);
        process.exit(1);
      }
    });

  // 도움말 개선
  slackCommand.on('--help', () => {
    console.log('');
    console.log('사용 예시:');
    console.log('  $ task-action send-message-slack "Hello, World!"');
    console.log('  $ task-action send-message-slack "배포 완료!"');
    console.log('  $ task-action send-message-slack "알림 메시지"');
    console.log('');
    console.log('환경 변수:');
    console.log('  SLACK_WEBHOOK_URL  Slack Webhook URL (필수)');
    console.log('');
    console.log('설명:');
    console.log('  이 명령은 Slack Webhook을 사용하여 메시지를 전송합니다.');
    console.log('  환경변수 SLACK_WEBHOOK_URL을 설정해야 합니다.');
    console.log('');
    console.log('Slack Webhook URL 설정 방법:');
    console.log('  1. Slack 앱에서 Incoming Webhooks 활성화');
    console.log('  2. 채널 선택 후 Webhook URL 복사');
    console.log(
      '  3. 환경변수 설정: export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."'
    );
  });

  return slackCommand;
}

/**
 * Slack 명령 사용 예시 표시
 */
export function showSlackExamples(): void {
  console.log('📤 Slack 명령 사용 예시:');
  console.log('');
  console.log('기본 사용법:');
  console.log('  $ task-action send-message-slack "Hello, World!"');
  console.log('  → Slack으로 메시지 전송');
  console.log('');
  console.log('다양한 메시지:');
  console.log('  $ task-action send-message-slack "배포 완료!"');
  console.log('  $ task-action send-message-slack "알림 메시지"');
  console.log('  $ task-action send-message-slack "시스템 점검 완료"');
  console.log('');
  console.log('환경 변수 설정:');
  console.log(
    '  $ export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."'
  );
  console.log('  $ task-action send-message-slack "환경변수로 전송"');
}
