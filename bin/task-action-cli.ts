#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn, ChildProcess } from 'child_process';

// Get the directory of this script
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

// Import and run the CLI from src/cli/index.ts using tsx
const cliPath: string = join(__dirname, '../src/cli/index.ts');

// Use tsx to run TypeScript directly
const child: ChildProcess = spawn('npx', ['tsx', cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
});

child.on('exit', (code: number | null) => {
  process.exit(code || 0);
});

child.on('error', (error: Error) => {
  console.error('Failed to start CLI:', error);
  process.exit(1);
});
