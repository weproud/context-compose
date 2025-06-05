import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Simple validation test...');

const projectRoot = process.cwd();
const configPath = '.taskaction';
const taskId = 'init';

// 1. Check if config directory exists
const configDir = join(projectRoot, configPath);
console.log('Config dir exists:', existsSync(configDir));

// 2. Check if task file exists
const taskFile = join(configDir, `task-${taskId}.yaml`);
console.log('Task file exists:', existsSync(taskFile));

// 3. Check referenced files
const referencedFiles = [
  'workflows/feature.yaml',
  'rules/the-must-follow.yaml',
  'rules/development.yaml', 
  'rules/refactoring.yaml',
  'mcps/sequential-thinking.yaml',
  'mcps/context7.yaml',
  'mcps/playwright.yaml'
];

console.log('\nReferenced files:');
referencedFiles.forEach(file => {
  const fullPath = join(configDir, file);
  const exists = existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\nTest completed successfully!');
