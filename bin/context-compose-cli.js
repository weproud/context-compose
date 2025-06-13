#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in development or production
const distCliPath = join(__dirname, '../dist/src/cli/index.js');
const srcCliPath = join(__dirname, '../src/cli/index.ts');

let cliPath;
let useTypeScript = false;

if (existsSync(distCliPath)) {
  // Production: use built JavaScript
  cliPath = distCliPath;
} else if (existsSync(srcCliPath)) {
  // Development: use TypeScript with tsx
  cliPath = srcCliPath;
  useTypeScript = true;
} else {
  console.error(
    '❌ CLI file not found. Please build the project or check the source files.'
  );
  process.exit(1);
}

// Execute the CLI
const args = useTypeScript
  ? ['npx', 'tsx', cliPath, ...process.argv.slice(2)]
  : ['node', cliPath, ...process.argv.slice(2)];

const child = spawn(args[0], args.slice(1), {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
});

child.on('exit', code => {
  process.exit(code || 0);
});

child.on('error', error => {
  console.error('❌ CLI execution failed:', error.message);
  process.exit(1);
});
