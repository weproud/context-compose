#!/usr/bin/env node

import { Command } from 'commander';
import { findPackageJson } from '../core/utils/package.js';
import { initCommand } from './commands/init.js';
import { registerStartContextCommand } from './commands/start-context.js';
import { validateContextCommand } from './commands/validate-context.js';

function main() {
  const program = new Command();

  const pkg = findPackageJson();

  program
    .name('context-compose')
    .description('A CLI for managing and composing context for AI models.')
    .version(pkg.version);

  // Register commands
  initCommand(program);
  registerStartContextCommand(program);
  validateContextCommand(program);

  program.parse(process.argv);
}

main();
