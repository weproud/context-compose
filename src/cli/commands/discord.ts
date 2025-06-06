import { Command } from 'commander';
import { DiscordTool } from '../../core/tools/discord.js';

/**
 * Create Discord command
 */
export function createDiscordCommand(): Command {
  const discordCommand = new Command('discord');
  discordCommand.description('Discord related commands');

  // Add send-message subcommand
  const sendMessageSubCommand = new Command('send-message');
  sendMessageSubCommand
    .description('Send message to Discord')
    .argument('<message>', 'Message to send to Discord')
    .action(async (message: string) => {
      try {
        console.log(`📤 Sending Discord message...`);

        const result = await DiscordTool.executeFromParams(
          message,
          process.cwd()
        );

        if (result.success) {
          console.log(result.message);
          console.log('📋 Sent message information:');
          console.log(`  - Message: "${result.sentMessage.content}"`);
        } else {
          console.error(`❌ ${result.message}`);
          process.exit(1);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Error occurred while sending Discord message: ${errorMessage}`
        );
        process.exit(1);
      }
    });

  discordCommand.addCommand(sendMessageSubCommand);

  // 도움말 개선
  discordCommand.on('--help', () => {
    console.log('');
    console.log('사용 예시:');
    console.log('  $ task-action discord send-message "Hello, World!"');
    console.log('  $ task-action discord send-message "배포 완료!"');
    console.log('  $ task-action discord send-message "알림 메시지"');
    console.log('');
    console.log('환경 변수:');
    console.log('  DISCORD_WEBHOOK_URL  Discord Webhook URL (필수)');
    console.log('');
    console.log('설명:');
    console.log('  이 명령은 Discord Webhook을 사용하여 메시지를 전송합니다.');
    console.log('  환경변수 DISCORD_WEBHOOK_URL을 설정해야 합니다.');
    console.log('');
    console.log('Discord Webhook URL 설정 방법:');
    console.log('  1. Discord 서버 설정에서 Integrations > Webhooks 선택');
    console.log('  2. New Webhook 생성 후 채널 선택');
    console.log('  3. Webhook URL 복사');
    console.log(
      '  4. 환경변수 설정: export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."'
    );
  });

  return discordCommand;
}

/**
 * Discord 명령 사용 예시 표시
 */
export function showDiscordExamples(): void {
  console.log('📤 Discord 명령 사용 예시:');
  console.log('');
  console.log('기본 사용법:');
  console.log('  $ task-action discord send-message "Hello, World!"');
  console.log('  → Discord로 메시지 전송');
  console.log('');
  console.log('다양한 메시지:');
  console.log('  $ task-action discord send-message "배포 완료!"');
  console.log('  $ task-action discord send-message "알림 메시지"');
  console.log('  $ task-action discord send-message "시스템 점검 완료"');
  console.log('');
  console.log('환경 변수 설정:');
  console.log(
    '  $ export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."'
  );
  console.log('  $ task-action discord send-message "환경변수로 전송"');
}
