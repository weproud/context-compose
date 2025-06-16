#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { findPackageJson } from '../core/utils/index.js';
import { initCommand } from './commands/init.js';
import { startContextCommand } from './commands/start-context.js';
import { validateContextCommand } from './commands/validate-context.js';

function startMCPServer() {
  console.info('🚀 Starting MCP server...');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const distServerPath = join(__dirname, '../../../dist/mcp-server/server.js');
  const srcServerPath = join(__dirname, '../../../mcp-server/server.ts');

  let serverPath: string;
  let useTypeScript = false;

  if (process.env.NODE_ENV === 'development' && existsSync(srcServerPath)) {
    serverPath = srcServerPath;
    useTypeScript = true;
  } else if (existsSync(distServerPath)) {
    serverPath = distServerPath;
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

  // Get version from package.json dynamically
  const packageJson = findPackageJson();

  const program = new Command();
  program
    .name('context-compose')
    .description('A CLI and MCP server for composable AI contexts.')
    .version(packageJson.version);

  // Register all commands
  initCommand(program);
  startContextCommand(program);
  validateContextCommand(program);

  program.parse(process.argv);
}

main();
