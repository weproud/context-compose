import { expect, test } from '@playwright/test';
import { exec } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const cliCommand = 'npm run context-compose --';

test.describe('Context Commands', () => {
  let tempDir: string;
  let assetsDir: string;
  const originalCwd = process.cwd();

  test.beforeEach(() => {
    tempDir = join(process.cwd(), `test-assets-${Date.now()}`);
    assetsDir = join(tempDir, 'assets');
    mkdirSync(assetsDir, { recursive: true });
    // Create subdirectories for personas, rules, etc.
    mkdirSync(join(assetsDir, 'personas'), { recursive: true });
    mkdirSync(join(assetsDir, 'rules'), { recursive: true });
    mkdirSync(join(assetsDir, 'mcps'), { recursive: true });
    mkdirSync(join(assetsDir, 'actions'), { recursive: true });

    // Change working directory to the temp directory so the CLI can find the assets
    process.chdir(tempDir);
  });

  test.afterEach(() => {
    // Change back to the original directory
    process.chdir(originalCwd);
    // Cleanup the temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test.describe('start-context', () => {
    test('should start a context and combine prompts', async () => {
      // Create a test context yaml file
      const contextContent = `
context:
  personas:
    - personas/eng-senior.yaml
  rules:
    - rules/common.yaml
  mcps:
    - mcps/sequential-thinking.yaml
`;
      writeFileSync(join(assetsDir, 'test-context.yaml'), contextContent);

      // Create dummy component files
      writeFileSync(
        join(assetsDir, 'personas', 'eng-senior.yaml'),
        'Persona prompt'
      );
      writeFileSync(join(assetsDir, 'rules', 'common.yaml'), 'Rule prompt');
      writeFileSync(
        join(assetsDir, 'mcps', 'sequential-thinking.yaml'),
        'MCP prompt'
      );

      const { stdout } = await execAsync(`${cliCommand} start-context test`);

      expect(stdout).toContain('Persona prompt');
      expect(stdout).toContain('Rule prompt');
      expect(stdout).toContain('MCP prompt');
    });

    test('should handle non-existent context file gracefully', async () => {
      try {
        await execAsync(`${cliCommand} start-context non-existent`);
      } catch (e) {
        const error = e as { stderr: string };
        expect(error.stderr).toContain('Context file not found');
      }
    });
  });

  test.describe('validate', () => {
    test('should validate a correct context successfully', async () => {
      // Create a test context yaml file
      const contextContent = `
context:
  personas:
    - personas/eng-senior.yaml
`;
      writeFileSync(join(assetsDir, 'valid-context.yaml'), contextContent);
      writeFileSync(
        join(assetsDir, 'personas', 'eng-senior.yaml'),
        'Persona prompt'
      );

      const { stdout } = await execAsync(`${cliCommand} validate valid`);

      expect(stdout).toContain('Context "valid" and its components are valid.');
    });

    test('should fail validation for context with missing files', async () => {
      // Create a test context yaml file with a reference to a non-existent file
      const contextContent = `
context:
  personas:
    - personas/non-existent.yaml
`;
      writeFileSync(join(assetsDir, 'invalid-context.yaml'), contextContent);

      try {
        await execAsync(`${cliCommand} validate invalid`);
      } catch (e) {
        const error = e as { stdout: string; stderr: string };
        const output = error.stdout + error.stderr;
        expect(output).toContain('Validation failed');
        expect(output).toContain('File not found');
        expect(output).toContain('personas/non-existent.yaml');
      }
    });

    test('should fail validation for syntactically incorrect YAML', async () => {
      // Create a syntactically incorrect yaml file
      const contextContent = `
context:
  personas:
    - personas/eng-senior.yaml
  rules:
    - rules/common.yaml
: invalid syntax
`;
      writeFileSync(join(assetsDir, 'bad-yaml-context.yaml'), contextContent);

      try {
        await execAsync(`${cliCommand} validate bad-yaml`);
      } catch (e) {
        const error = e as { stderr: string };
        expect(error.stderr).toContain('Error parsing YAML file');
      }
    });
  });
});
