#!/usr/bin/env node

import { Command } from 'commander';
import { createEnvCommand } from './commands/env.js';
import { createInitCommand } from './commands/init.js';
import { createStartContextCommand } from './commands/start-context.js';
import { createValidateContextCommand } from './commands/validate-context.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import packageJson from '../../../package.json' assert { type: 'json' };

/**
 * Create main CLI command
 */
export function createCli(): Command {
  const program = new Command();

  program
    .name('context-compose')
    .version(packageJson.version)
    .description('CLI tool for composing and managing AI development contexts');

  // Add commands
  program.addCommand(createInitCommand());
  program.addCommand(createStartContextCommand());
  program.addCommand(createValidateContextCommand());
  program.addCommand(createEnvCommand());

  return program;
}
