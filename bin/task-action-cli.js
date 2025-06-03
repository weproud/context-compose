#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the CLI from src/cli/index.ts using tsx
import { spawn } from 'child_process';

const cliPath = join(__dirname, '../src/cli/index.ts');

// Use tsx to run TypeScript directly
const child = spawn('npx', ['tsx', cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Failed to start CLI:', error);
  process.exit(1);
});
