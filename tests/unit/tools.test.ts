import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InitTool, GetContextTool } from '../../src/core/tools/index.js';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('MCP Tools', () => {
  describe('Init Tool', () => {
    it('should initialize project with default settings', async () => {
      const result = await InitTool.execute();

      expect(result).toMatchObject({
        success: expect.any(Boolean),
        message: expect.any(String),
        createdFiles: expect.any(Array),
        skippedFiles: expect.any(Array),
      });
    });

    it('should validate input parameters', async () => {
      await expect(
        InitTool.executeWithValidation({ projectRoot: 123 })
      ).rejects.toThrow();
    });
  });

  describe('Get Context Tool', () => {
    let testProjectRoot: string;
    let testConfigDir: string;

    beforeEach(() => {
      // 임시 테스트 디렉토리 생성
      testProjectRoot = join(tmpdir(), `test-project-${Date.now()}`);
      testConfigDir = join(testProjectRoot, '.taskaction');

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
      // context-feature.yaml 파일 생성
      const contextFeatureContent = `version: 1
kind: task
name: 'feature'
description: 'feature context'

id: context-feature
context:
  workflow: workflows/workflow.yaml
  rules:
    - rules/the-must-follow.yaml
    - rules/development.yaml
  mcps:
    - mcps/sequential-thinking.yaml
    - mcps/context7.yaml
  notify:
    - notify/slack.yaml
prompt: |
  this is feature context task`;

      writeFileSync(
        join(testConfigDir, 'context-feature.yaml'),
        contextFeatureContent,
        'utf8'
      );

      // 참조되는 파일들 생성
      const workflowContent = `version: 1
kind: workflow
name: 'Test Workflow'
description: 'Test workflow description'
prompt: 'Test workflow prompt'`;

      const ruleContent = `version: 1
kind: rule
name: 'Test Rule'
description: 'Test rule description'
prompt: 'Test rule prompt'`;

      const mcpContent = `version: 1
kind: mcp
name: 'Test MCP'
description: 'Test MCP description'
prompt: 'Test MCP prompt'`;

      const notifyContent = `version: 1
kind: notify
name: 'Test Notify'
description: 'Test notify description'
prompt: 'Test notify prompt'`;

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
        join(testConfigDir, 'mcps', 'context7.yaml'),
        mcpContent,
        'utf8'
      );
      writeFileSync(
        join(testConfigDir, 'notify', 'slack.yaml'),
        notifyContent,
        'utf8'
      );

      // GetContextTool 실행
      const result = await GetContextTool.execute({
        contextId: 'feature',
        projectRoot: testProjectRoot,
        enhancedPrompt: false,
      });

      // 결과 검증
      expect(result.success).toBe(true);
      expect(result.contextId).toBe('feature');
      expect(result.message).toContain("Context 'feature' is ready");
      expect(result.combinedPrompt).toContain('Task: feature');
      expect(result.combinedPrompt).toContain('feature context');
      expect(result.combinedPrompt).toContain('this is feature context task');
      expect(result.files).toMatchObject({
        workflow: 'workflows/workflow.yaml',
        rules: ['rules/the-must-follow.yaml', 'rules/development.yaml'],
        mcps: ['mcps/sequential-thinking.yaml', 'mcps/context7.yaml'],
        notify: ['notify/slack.yaml'],
      });
    });

    it('should handle missing context file gracefully', async () => {
      // 존재하지 않는 context 파일에 대한 테스트
      const result = await GetContextTool.execute({
        contextId: 'nonexistent',
        projectRoot: testProjectRoot,
        enhancedPrompt: false,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to get context');
      expect(result.contextId).toBe('nonexistent');
    });

    it('should use enhanced prompt when requested', async () => {
      // context-feature.yaml 파일 생성
      const contextFeatureContent = `version: 1
kind: task
name: 'feature'
description: 'feature context'

id: context-feature
context:
  workflow: workflows/workflow.yaml
prompt: |
  this is feature context task`;

      writeFileSync(
        join(testConfigDir, 'context-feature.yaml'),
        contextFeatureContent,
        'utf8'
      );

      // enhanced prompt가 있는 workflow 파일 생성
      const workflowContent = `version: 1
kind: workflow
name: 'Test Workflow'
description: 'Test workflow description'
prompt: 'Simple workflow prompt'
prompt-enhanced: 'Enhanced workflow prompt with detailed guidelines'`;

      writeFileSync(
        join(testConfigDir, 'workflows', 'workflow.yaml'),
        workflowContent,
        'utf8'
      );

      // enhanced prompt 사용
      const result = await GetContextTool.execute({
        contextId: 'feature',
        projectRoot: testProjectRoot,
        enhancedPrompt: true,
      });

      expect(result.success).toBe(true);
      expect(result.combinedPrompt).toContain(
        'Enhanced workflow prompt with detailed guidelines'
      );
      expect(result.combinedPrompt).not.toContain('Simple workflow prompt');
    });
  });
});
