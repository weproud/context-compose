#!/usr/bin/env node

import { Command } from 'commander';
import { findPackageJson } from '../core/utils/package.js';
import { initCommand } from './commands/init.js';
import { registerServeCommand } from './commands/serve.js';
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
  registerServeCommand(program);

  const commandNames = program.commands.map((cmd) => cmd.name());
  const args = process.argv.slice(2);
  const hasCommand = args.some((arg) => commandNames.includes(arg));
  const hasOptions = args.some((arg) => arg.startsWith('-'));

  if (!hasCommand && !hasOptions) {
    // Default to serve command when no arguments are provided
    process.argv.splice(2, 0, 'serve');
  }

  program.parse(process.argv);
}

main();
