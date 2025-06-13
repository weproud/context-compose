#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnvCommand } from './commands/env.js';
import { createInitCommand } from './commands/init.js';
import { createStartContextCommand } from './commands/start-context.js';
import { createValidateContextCommand } from './commands/validate-context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../../package.json'), 'utf-8')
);

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
