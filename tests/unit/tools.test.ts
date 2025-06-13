import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  executeInit,
  executeInitTool,
  executeStartContextTool,
} from '../../src/core/tools/index.js';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('MCP Tools', () => {
  describe('Init Tool', () => {
    it('should initialize project with default settings', async () => {
      const result = await executeInit(tmpdir());
      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        success: expect.any(Boolean),
        message: expect.any(String),
        createdFiles: expect.any(Array),
      });
    });

    it('should validate input parameters', async () => {
      await expect(executeInitTool({ projectRoot: 123 })).rejects.toThrow();
    });
  });

  describe('Start Context Tool', () => {
    let testProjectRoot: string;
    let testConfigDir: string;

    beforeEach(() => {
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
    });

    afterEach(() => {
      // 테스트 후 정리
      if (existsSync(testProjectRoot)) {
        rmSync(testProjectRoot, { recursive: true, force: true });
      }
    });

    it('should read context-feature.yaml file successfully', async () => {
      // assets 디렉토리 생성
      mkdirSync(join(testProjectRoot, 'assets'), { recursive: true });

      // context-feature.yaml 파일 생성
      const contextFeatureContent = `version: 1
kind: 'context'
name: 'feature'
description: 'feature context'
context:
  rules:
    - 'rules/the-must-follow.yaml'
    - 'rules/development.yaml'
  mcps:
    - 'mcps/sequential-thinking.yaml'
    - 'mcps/context7.yaml'
  personas:
    - 'personas/software-developer.yaml'
'enhanced-prompt': |
  This is the enhanced prompt for the feature context.
prompt: |
  This is the simple prompt for the feature context.`;

      const contextComposeDir = join(testProjectRoot, '.contextcompose');
      mkdirSync(contextComposeDir, { recursive: true });
      writeFileSync(
        join(contextComposeDir, 'feature-context.yaml'),
        contextFeatureContent,
        'utf8'
      );

      // 참조되는 파일들 생성 (간략화)
      const genericComponentContent = (name: string) => `version: 1
kind: component
name: ${name}
prompt: 'This is a prompt for ${name}'
enhanced-prompt: 'This is an enhanced prompt for ${name}'`;

      const rulesDir = join(contextComposeDir, 'rules');
      const mcpsDir = join(contextComposeDir, 'mcps');
      const personasDir = join(contextComposeDir, 'personas');
      mkdirSync(rulesDir, { recursive: true });
      mkdirSync(mcpsDir, { recursive: true });
      mkdirSync(personasDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'the-must-follow.yaml'),
        genericComponentContent('the-must-follow')
      );
      writeFileSync(
        join(rulesDir, 'development.yaml'),
        genericComponentContent('development')
      );
      writeFileSync(
        join(mcpsDir, 'sequential-thinking.yaml'),
        genericComponentContent('sequential-thinking')
      );
      writeFileSync(
        join(mcpsDir, 'context7.yaml'),
        genericComponentContent('context7')
      );
      writeFileSync(
        join(personasDir, 'software-developer.yaml'),
        genericComponentContent('software-developer')
      );

      // StartContextTool 실행
      const result = await executeStartContextTool({
        contextName: 'feature',
        projectRoot: testProjectRoot,
        enhancedPrompt: false,
      });

      // 결과 검증 - 실패 시 에러 메시지 출력
      if (!result.success) {
        console.log('Test failed with message:', result.message);
      }
      expect(result.success).toBe(true);
      expect(result.contextName).toBe('feature');
      expect(result.message).toContain(
        "Context 'feature' started successfully."
      );
      expect(result.combinedPrompt).toContain('What task should we start?');
      expect(result.files).toBeDefined();
    });

    it('should handle missing context file gracefully', async () => {
      // 존재하지 않는 context 파일에 대한 테스트
      const result = await executeStartContextTool({
        contextName: 'nonexistent',
        projectRoot: testProjectRoot,
        enhancedPrompt: false,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'Failed to start context: File not found'
      );
      expect(result.contextName).toBe('nonexistent');
    });

    it('should use enhanced prompt when requested', async () => {
      // context-feature.yaml 파일 생성 (위와 동일하게 사용)
      const contextFeatureContent = `version: 1
kind: 'context'
name: 'feature'
description: 'feature context'
context:
  rules:
    - 'rules/the-must-follow.yaml'
'enhanced-prompt': |
  This is the enhanced prompt for the feature context.
prompt: |
  This is the simple prompt for the feature context.`;

      const contextComposeDir = join(testProjectRoot, '.contextcompose');
      mkdirSync(contextComposeDir, { recursive: true });
      const rulesDir = join(contextComposeDir, 'rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(contextComposeDir, 'feature-context.yaml'),
        contextFeatureContent,
        'utf8'
      );
      writeFileSync(
        join(rulesDir, 'the-must-follow.yaml'),
        `version: 1\\nkind: rule\\nprompt: 'Rule prompt'\\nenhanced-prompt: 'Enhanced Rule prompt'`,
        'utf8'
      );

      // enhanced prompt 사용
      const result = await executeStartContextTool({
        contextName: 'feature',
        projectRoot: testProjectRoot,
        enhancedPrompt: true,
      });

      if (!result.success) {
        console.log('Test failed with message:', result.message);
      }
      expect(result.success).toBe(true);
      expect(result.combinedPrompt).toContain('This is the enhanced prompt');
      expect(result.combinedPrompt).not.toContain('This is the simple prompt');
    });
  });
});
