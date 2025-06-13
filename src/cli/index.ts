#!/usr/bin/env node

import { Command } from 'commander';
import { createStartContextCommand } from './commands/start-context.js';
import { createInitCommand } from './commands/init.js';
import { createValidateContextCommand } from './commands/validate-context.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

function startMCPServer() {
  console.log('🚀 Starting MCP server...');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const distServerPath = join(__dirname, '../../../dist/mcp-server/server.js');
  const srcServerPath = join(__dirname, '../../../mcp-server/server.ts');

  let serverPath;
  let useTypeScript = false;

  if (existsSync(distServerPath)) {
    serverPath = distServerPath;
  } else if (existsSync(srcServerPath)) {
    serverPath = srcServerPath;
    useTypeScript = true;
  } else {
    console.error(
      '❌ MCP server file not found. Please build the project or check the source files.'
    );
    process.exit(1);
  }

  const command = useTypeScript ? 'npx' : 'node';
  const commandArgs = useTypeScript ? ['tsx', serverPath] : [serverPath];

  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    cwd: join(__dirname, '../../..'),
  });

  child.on('exit', (code: number | null) => {
    if (code !== 0) {
      console.error(`MCP server exited with code ${code}`);
    }
  });

  child.on('error', (error: Error) => {
    console.error('❌ MCP server execution failed:', error.message);
  });
}

/**
 * Main CLI logic
 */
function main() {
  // If no arguments are provided (e.g., "context-compose"), start the MCP server.
  if (process.argv.length <= 2) {
    startMCPServer();
    return;
  }

  const program = new Command();
  program
    .name('context-compose')
    .description('A CLI and MCP server for composable AI contexts.')
    .version('1.2.0'); // Make sure this is in sync with package.json

  // Register all commands
  program.addCommand(createInitCommand());
  program.addCommand(createStartContextCommand());
  program.addCommand(createValidateContextCommand());

  program.parse(process.argv);
}

main();
