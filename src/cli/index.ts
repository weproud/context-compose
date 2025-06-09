#!/usr/bin/env node

import { Command } from 'commander';
import { createInitCommand, showInitExamples } from './commands/init.js';
import {
  createGetContextCommand,
  showGetContextExamples,
} from './commands/get-context.js';
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

  // Add Get Context command (direct command)
  program.addCommand(createGetContextCommand());

  // Add environment variable command
  // program.addCommand(createEnvCommand());

  // Add Examples command
  const examplesCommand = new Command('examples');
  examplesCommand
    .description('Show usage examples')
    .option(
      '-c, --command <command>',
      'Show examples for specific command only (init, task, get-context)'
    )
    .action((options: { command?: string }) => {
      if (options.command) {
        switch (options.command) {
          case 'init':
            showInitExamples();
            break;
          case 'get-context':
            showGetContextExamples();
            break;
          // case 'env':
          //   showEnvExamples();
          //   break;
          default:
            console.error(`❌ Unknown command: ${options.command}`);
            console.log('Available commands: init, task, get-context');
            process.exit(1);
        }
      } else {
        console.log('🛠️  MCP CLI Tool Usage Examples\n');
        showInitExamples();
        console.log('');
        showGetContextExamples();
        console.log(
          '\nFor more detailed information, use the --help option for each command.'
        );
        console.log(
          'Example: task-action init --help, task-action task --help, task-action get-context --help'
        );
      }
    });

  program.addCommand(examplesCommand);

  // Improve help
  program.on('--help', () => {
    console.log('');
    console.log('Usage examples:');
    console.log('  $ task-action init');
    console.log('  $ task-action get-context context-default');
    console.log('  $ task-action task validate context-default');
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
