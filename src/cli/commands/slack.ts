import { Command } from 'commander';
import { SlackTool } from '../../core/tools/slack.js';

/**
 * Create Slack command
 */
export function createSlackCommand(): Command {
  const slackCommand = new Command('slack');
  slackCommand.description('Slack related commands');

  // Add send-message subcommand
  const sendMessageSubCommand = new Command('send-message');
  sendMessageSubCommand
    .description('Send message to Slack')
    .argument('<message>', 'Message to send to Slack')
    .action(async (message: string) => {
      try {
        console.log(`📤 Sending Slack message...`);

        const result = await SlackTool.executeFromParams(
          message,
          process.cwd()
        );

        if (result.success) {
          console.log(result.message);
          console.log('📋 Sent message information:');
          console.log(`  - Message: "${result.sentMessage.text}"`);
        } else {
          console.error(`❌ ${result.message}`);
          process.exit(1);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Error occurred while sending Slack message: ${errorMessage}`
        );
        process.exit(1);
      }
    });

  slackCommand.addCommand(sendMessageSubCommand);

  // Improve help
  slackCommand.on('--help', () => {
    console.log('');
    console.log('Usage examples:');
    console.log('  $ task-action slack send-message "Hello, World!"');
    console.log('  $ task-action slack send-message "Deployment completed!"');
    console.log('  $ task-action slack send-message "Notification message"');
    console.log('');
    console.log('Environment variables:');
    console.log('  SLACK_WEBHOOK_URL  Slack Webhook URL (required)');
    console.log('');
    console.log('Description:');
    console.log('  This command sends messages using Slack Webhook.');
    console.log('  You must set the SLACK_WEBHOOK_URL environment variable.');
    console.log('');
    console.log('How to set up Slack Webhook URL:');
    console.log('  1. Enable Incoming Webhooks in Slack app');
    console.log('  2. Select channel and copy Webhook URL');
    console.log(
      '  3. Set environment variable: export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."'
    );
  });

  return slackCommand;
}

/**
 * Display Slack command usage examples
 */
export function showSlackExamples(): void {
  console.log('📤 Slack Command Usage Examples:');
  console.log('');
  console.log('Basic usage:');
  console.log('  $ task-action slack send-message "Hello, World!"');
  console.log('  → Send message to Slack');
  console.log('');
  console.log('Various messages:');
  console.log('  $ task-action slack send-message "Deployment completed!"');
  console.log('  $ task-action slack send-message "Notification message"');
  console.log(
    '  $ task-action slack send-message "System maintenance completed"'
  );
  console.log('');
  console.log('Environment variable setup:');
  console.log(
    '  $ export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."'
  );
  console.log(
    '  $ task-action slack send-message "Send via environment variable"'
  );
}
