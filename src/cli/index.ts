#!/usr/bin/env node

import { Command } from 'commander';
import { createInitCommand, showInitExamples } from './commands/init.js';
import { createSlackCommand, showSlackExamples } from './commands/slack.js';
import {
  createDiscordCommand,
  showDiscordExamples,
} from './commands/discord.js';
// import { createEnvCommand, showEnvExamples } from './commands/env.js';

/**
 * MCP CLI 도구 메인 프로그램
 */
function createCLI(): Command {
  const program = new Command();

  program
    .name('task-action')
    .description(
      'Task Action Model Context Protocol (MCP) 서버 도구들을 위한 CLI'
    )
    .version('1.0.0');

  // Init 명령 추가
  program.addCommand(createInitCommand());

  // Slack 명령 추가
  program.addCommand(createSlackCommand());

  // Discord 명령 추가
  program.addCommand(createDiscordCommand());

  // 환경변수 명령 추가
  // program.addCommand(createEnvCommand());

  // Examples 명령 추가
  const examplesCommand = new Command('examples');
  examplesCommand
    .description('사용 예시를 보여줍니다')
    .option(
      '-c, --command <command>',
      '특정 명령의 예시만 표시 (init, send-message-slack, send-message-discord)'
    )
    .action((options: { command?: string }) => {
      if (options.command) {
        switch (options.command) {
          case 'init':
            showInitExamples();
            break;
          case 'send-message-slack':
            showSlackExamples();
            break;
          case 'send-message-discord':
            showDiscordExamples();
            break;
          // case 'env':
          //   showEnvExamples();
          //   break;
          default:
            console.error(`❌ 알 수 없는 명령: ${options.command}`);
            console.log(
              '사용 가능한 명령: init, send-message-slack, send-message-discord'
            );
            process.exit(1);
        }
      } else {
        console.log('🛠️  MCP CLI 도구 사용 예시\n');
        showInitExamples();
        console.log('');
        showSlackExamples();
        console.log('');
        showDiscordExamples();
        console.log('\n더 자세한 정보는 각 명령에 --help 옵션을 사용하세요.');
        console.log(
          '예: task-action init --help, task-action send-message-slack --help, task-action send-message-discord --help'
        );
      }
    });

  program.addCommand(examplesCommand);

  // 도움말 개선
  program.on('--help', () => {
    console.log('');
    console.log('사용 예시:');
    console.log('  $ task-action init');
    console.log('  $ task-action send-message-slack "Hello, World!"');
    console.log('  $ task-action send-message-discord "Hello, Discord!"');
    console.log('  $ task-action examples');
    console.log('');
    console.log('더 많은 예시를 보려면:');
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
