#!/usr/bin/env node

import { Command } from 'commander';
import { createInitCommand, showInitExamples } from './commands/init.js';
import { createTaskCommand, showTaskExamples } from './commands/task.js';
import { createSlackCommand, showSlackExamples } from './commands/slack.js';
import {
  createDiscordCommand,
  showDiscordExamples,
} from './commands/discord.js';
import { createTestCommand } from './commands/test-simple.js';
// import { createEnvCommand, showEnvExamples } from './commands/env.js';

/**
 * MCP CLI tool main program
 */
function createCLI(): Command {
  const program = new Command();

  program
    .name('task-action')
    .description(
      'CLI for Task Action Model Context Protocol (MCP) server tools'
    )
    .version('1.0.0');

  // Add Init command
  program.addCommand(createInitCommand());

  // Add Task command (includes add, start subcommands)
  program.addCommand(createTaskCommand());

  // Add Slack command
  program.addCommand(createSlackCommand());

  // Add Discord command
  program.addCommand(createDiscordCommand());

  // Add Test command
  program.addCommand(createTestCommand());

  // Add environment variable command
  // program.addCommand(createEnvCommand());

  // Add Examples command
  const examplesCommand = new Command('examples');
  examplesCommand
    .description('Show usage examples')
    .option(
      '-c, --command <command>',
      'Show examples for specific command only (init, task, slack, discord, test)'
    )
    .action((options: { command?: string }) => {
      if (options.command) {
        switch (options.command) {
          case 'init':
            showInitExamples();
            break;
          case 'task':
            showTaskExamples();
            break;
          case 'slack':
            showSlackExamples();
            break;
          case 'discord':
            showDiscordExamples();
            break;
          case 'test':
            console.log('🧪 Test Command Usage Examples\n');
            console.log('Basic usage:');
            console.log('  task-action test actions/create-branch');
            console.log('  task-action test notify/slack-send-message');
            console.log('  task-action test actions/git-commit');
            console.log('  task-action test notify/discord-send-message');
            console.log('\nAdditional commands:');
            console.log(
              '  task-action test list                    # List available tests'
            );
            console.log(
              '  task-action test check                   # Check environment settings'
            );
            console.log(
              '  task-action test check --type slack     # Check Slack settings only'
            );
            break;
          // case 'env':
          //   showEnvExamples();
          //   break;
          default:
            console.error(`❌ Unknown command: ${options.command}`);
            console.log('Available commands: init, task, slack, discord, test');
            process.exit(1);
        }
      } else {
        console.log('🛠️  MCP CLI Tool Usage Examples\n');
        showInitExamples();
        console.log('');
        showTaskExamples();
        console.log('');
        showSlackExamples();
        console.log('');
        showDiscordExamples();
        console.log(
          '\nFor more detailed information, use the --help option for each command.'
        );
        console.log(
          'Example: task-action init --help, task-action task --help, task-action slack --help, task-action discord --help'
        );
      }
    });

  program.addCommand(examplesCommand);

  // Improve help
  program.on('--help', () => {
    console.log('');
    console.log('Usage examples:');
    console.log('  $ task-action init');
    console.log('  $ task-action task add "create user controller"');
    console.log('  $ task-action task start init');
    console.log('  $ task-action task status init done');
    console.log('  $ task-action slack send-message "Hello, World!"');
    console.log('  $ task-action discord send-message "Hello, Discord!"');
    console.log('  $ task-action test actions/create-branch');
    console.log('  $ task-action test notify/slack-send-message');
    console.log('  $ task-action examples');
    console.log('');
    console.log('To see more examples:');
    console.log('  $ task-action examples');
  });

  return program;
}

/**
 * CLI 실행
 */
async function main(): Promise<void> {
  const program = createCLI();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ CLI 실행 중 오류 발생: ${errorMessage}`);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출 (ES modules 방식)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ 예상치 못한 오류:', error);
    process.exit(1);
  });
}

export { createCLI };
