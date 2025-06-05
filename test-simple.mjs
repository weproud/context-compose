// Simple test - file reading verification
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';

const projectRoot = '/Users/raiiz/madeinnook/workspace/task-action';
const configPath = '.taskaction';

console.log('🧪 Testing file reading...\n');

// Task 파일 읽기 테스트
const taskFilePath = join(projectRoot, configPath, 'task-init.yaml');
console.log('Task file path:', taskFilePath);
console.log('Task file exists:', existsSync(taskFilePath));

if (existsSync(taskFilePath)) {
  const taskContent = readFileSync(taskFilePath, 'utf8');
  const taskYaml = parseYaml(taskContent);

  console.log('\n📄 Task YAML:');
  console.log('Name:', taskYaml.name);
  console.log('Jobs sections:', Object.keys(taskYaml.jobs));

  // Check files in each section
  for (const [sectionName, sectionValue] of Object.entries(taskYaml.jobs)) {
    console.log(`\n📁 ${sectionName}:`, sectionValue);

    if (typeof sectionValue === 'string') {
      const filePath = join(projectRoot, configPath, sectionValue);
      console.log(`  File exists: ${existsSync(filePath)}`);
    } else if (Array.isArray(sectionValue)) {
      sectionValue.forEach(file => {
        const filePath = join(projectRoot, configPath, file);
        console.log(`  ${file}: ${existsSync(filePath)}`);
      });
    }
  }
}
