#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in development or production
const distServerPath = join(__dirname, '../dist/mcp-server/server.js');
const srcServerPath = join(__dirname, '../mcp-server/server.ts');

let serverPath;
let useTypeScript = false;

if (existsSync(distServerPath)) {
  // Production: use built JavaScript
  serverPath = distServerPath;
} else if (existsSync(srcServerPath)) {
  // Development: use TypeScript with tsx
  serverPath = srcServerPath;
  useTypeScript = true;
} else {
  console.error(
    '❌ MCP server file not found. Please build the project or check the source files.'
  );
  process.exit(1);
}

// Execute the MCP server
const args = useTypeScript
  ? ['npx', 'tsx', serverPath, ...process.argv.slice(2)]
  : ['node', serverPath, ...process.argv.slice(2)];

const child = spawn(args[0], args.slice(1), {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
});

child.on('exit', code => {
  process.exit(code || 0);
});

child.on('error', error => {
  console.error('❌ MCP server execution failed:', error.message);
  process.exit(1);
});
