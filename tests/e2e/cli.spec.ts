import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

test.describe('MCP CLI Tool', () => {
  test('should show help message', async () => {
    const { stdout } = await execAsync('npm run cli -- --help');

    expect(stdout).toContain(
      'CLI for Model Context Protocol (MCP) server tools'
    );
    expect(stdout).toContain('add');
    expect(stdout).toContain('fetch-weather');
  });

  test('should handle invalid command gracefully', async () => {
    try {
      await execAsync('npm run cli -- invalid-command');
    } catch (error) {
      expect(error.stderr || error.stdout).toContain('error');
    }
  });
});

test.describe('Task Action Get Context CLI', () => {
  let testProjectRoot: string;
  let testConfigDir: string;
  let originalCwd: string;

  test.beforeEach(async () => {
    originalCwd = process.cwd();

    // 임시 테스트 디렉토리 생성
    testProjectRoot = join(tmpdir(), `test-project-${Date.now()}`);
    testConfigDir = join(testProjectRoot, '.contextcompose');

    mkdirSync(testProjectRoot, { recursive: true });
    mkdirSync(testConfigDir, { recursive: true });

    // 필요한 하위 디렉토리들 생성
    mkdirSync(join(testConfigDir, 'workflows'), { recursive: true });
    mkdirSync(join(testConfigDir, 'rules'), { recursive: true });
    mkdirSync(join(testConfigDir, 'mcps'), { recursive: true });
    mkdirSync(join(testConfigDir, 'notify'), { recursive: true });

    // 테스트 디렉토리로 이동
    process.chdir(testProjectRoot);
  });

  test.afterEach(async () => {
    // 원래 디렉토리로 복원
    process.chdir(originalCwd);

    // 테스트 후 정리
    if (existsSync(testProjectRoot)) {
      rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  test('should execute get-context feature command successfully', async () => {
    // context-feature.yaml 파일 생성
    const contextFeatureContent = `version: 1
kind: task
name: 'feature'
description: 'feature context for testing'

context:
  workflow: workflows/workflow.yaml
  rules:
    - rules/the-must-follow.yaml
    - rules/development.yaml
  mcps:
    - mcps/sequential-thinking.yaml
  notify:
    - notify/slack.yaml
prompt: |
  this is feature context task for CLI testing`;

    writeFileSync(
      join(testConfigDir, 'context-feature.yaml'),
      contextFeatureContent,
      'utf8'
    );

    // 참조되는 파일들 생성
    const workflowContent = `version: 1
kind: workflow
name: 'Test Workflow'
description: 'Test workflow for CLI'
prompt: 'Test workflow prompt for CLI testing'`;

    const ruleContent = `version: 1
kind: rule
name: 'Test Rule'
description: 'Test rule for CLI'
prompt: 'Test rule prompt for CLI testing'`;

    const mcpContent = `version: 1
kind: mcp
name: 'Test MCP'
description: 'Test MCP for CLI'
prompt: 'Test MCP prompt for CLI testing'`;

    const notifyContent = `version: 1
kind: notify
name: 'Test Notify'
description: 'Test notify for CLI'
prompt: 'Test notify prompt for CLI testing'`;

    writeFileSync(
      join(testConfigDir, 'workflows', 'workflow.yaml'),
      workflowContent,
      'utf8'
    );
    writeFileSync(
      join(testConfigDir, 'rules', 'the-must-follow.yaml'),
      ruleContent,
      'utf8'
    );
    writeFileSync(
      join(testConfigDir, 'rules', 'development.yaml'),
      ruleContent,
      'utf8'
    );
    writeFileSync(
      join(testConfigDir, 'mcps', 'sequential-thinking.yaml'),
      mcpContent,
      'utf8'
    );
    writeFileSync(
      join(testConfigDir, 'notify', 'slack.yaml'),
      notifyContent,
      'utf8'
    );

    // task-action get-context feature 명령어 실행
    const { stdout } = await execAsync(
      `${originalCwd}/bin/task-action-cli.js get-context feature`
    );

    // 결과 검증
    expect(stdout).toContain("Context 'feature' is ready");
    expect(stdout).toContain('Task: feature');
    expect(stdout).toContain('feature context for testing');
    expect(stdout).toContain('this is feature context task for CLI testing');
    expect(stdout).toContain('Test Workflow');
    expect(stdout).toContain('Test Rule');
    expect(stdout).toContain('Test MCP');
    expect(stdout).toContain('Test Notify');
  });

  test('should execute get-context feature command with enhanced prompt', async () => {
    // context-feature.yaml 파일 생성
    const contextFeatureContent = `version: 1
kind: task
name: 'feature'
description: 'feature context for enhanced testing'

context:
  workflow: workflows/workflow.yaml
prompt: |
  this is feature context task for enhanced CLI testing`;

    writeFileSync(
      join(testConfigDir, 'context-feature.yaml'),
      contextFeatureContent,
      'utf8'
    );

    // enhanced prompt가 있는 workflow 파일 생성
    const workflowContent = `version: 1
kind: workflow
name: 'Enhanced Test Workflow'
description: 'Enhanced test workflow for CLI'
prompt: 'Simple workflow prompt'
prompt-enhanced: 'Enhanced workflow prompt with detailed guidelines for CLI testing'`;

    writeFileSync(
      join(testConfigDir, 'workflows', 'workflow.yaml'),
      workflowContent,
      'utf8'
    );

    // task-action get-context feature --enhanced-prompt 명령어 실행
    const { stdout } = await execAsync(
      `${originalCwd}/bin/task-action-cli.js get-context feature --enhanced-prompt`
    );

    // 결과 검증
    expect(stdout).toContain("Context 'feature' is ready");
    expect(stdout).toContain(
      'Enhanced workflow prompt with detailed guidelines for CLI testing'
    );
    expect(stdout).not.toContain('Simple workflow prompt');
  });

  test('should handle missing context file gracefully in CLI', async () => {
    // 존재하지 않는 context 파일에 대한 CLI 테스트
    try {
      await execAsync(
        `${originalCwd}/bin/task-action-cli.js get-context nonexistent`
      );
    } catch (error) {
      expect(error.stderr || error.stdout).toContain('Failed to get context');
      expect(error.stderr || error.stdout).toContain('File not found');
    }
  });
});
