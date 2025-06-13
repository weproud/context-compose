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

let entryPointPath;
let useTypeScript = false;

if (existsSync(distCliPath)) {
  // Production: use built JavaScript
  entryPointPath = distCliPath;
} else if (existsSync(srcCliPath)) {
  // Development: use TypeScript with tsx
  entryPointPath = srcCliPath;
  useTypeScript = true;
} else {
  console.error(
    '❌ Entry point file not found. Please build the project or check the source files.'
  );
  process.exit(1);
}

// Execute the unified CLI/server script
const args = useTypeScript
  ? ['npx', 'tsx', entryPointPath, ...process.argv.slice(2)]
  : ['node', entryPointPath, ...process.argv.slice(2)];

const child = spawn(args[0], args.slice(1), {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
});

child.on('exit', code => {
  process.exit(code || 0);
});

child.on('error', error => {
  console.error('❌ Execution failed:', error.message);
  process.exit(1);
});
