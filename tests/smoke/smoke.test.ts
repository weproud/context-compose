import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Smoke Tests - 핵심 기능들의 빠른 검증
 * 이 테스트들은 CLI와 MCP 도구의 기본적인 동작을 확인합니다.
 */
describe('Smoke Tests', () => {
  let testProjectRoot: string;
  const originalCwd = process.cwd();

  beforeEach(() => {
    // 임시 테스트 디렉토리 생성
    testProjectRoot = join(tmpdir(), `smoke-test-${Date.now()}`);
    mkdirSync(testProjectRoot, { recursive: true });
    process.chdir(testProjectRoot);
  });

  afterEach(() => {
    // 원래 디렉토리로 복원
    process.chdir(originalCwd);
    
    // 테스트 후 정리
    if (existsSync(testProjectRoot)) {
      rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  describe('CLI Basic Commands', () => {
    it('should show help without errors', () => {
      const result = execSync('npx tsx ../../src/cli/index.ts --help', { 
        encoding: 'utf8',
        cwd: originalCwd 
      });
      
      expect(result).toContain('CLI for Context Compose');
      expect(result).toContain('init');
      expect(result).toContain('start-context');
      expect(result).toContain('validate');
    });

    it('should show version without errors', () => {
      const result = execSync('npx tsx ../../src/cli/index.ts --version', { 
        encoding: 'utf8',
        cwd: originalCwd 
      });
      
      expect(result.trim()).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should handle invalid command gracefully', () => {
      try {
        execSync('npx tsx ../../src/cli/index.ts invalid-command', { 
          encoding: 'utf8',
          cwd: originalCwd,
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.status).toBe(1);
        expect(error.stderr || error.stdout).toContain('error');
      }
    });
  });

  describe('Init Command', () => {
    it('should initialize project successfully', () => {
      const result = execSync('npx tsx ../../src/cli/index.ts init', { 
        encoding: 'utf8',
        cwd: originalCwd 
      });
      
      expect(result).toContain('Context Compose initialized successfully');
      expect(existsSync(join(testProjectRoot, '.contextcompose'))).toBe(true);
      expect(existsSync(join(testProjectRoot, 'assets'))).toBe(true);
    });

    it('should create all required directories', () => {
      execSync('npx tsx ../../src/cli/index.ts init', { 
        cwd: originalCwd,
        stdio: 'pipe'
      });
      
      const requiredDirs = [
        '.contextcompose',
        'assets',
        'assets/personas',
        'assets/rules',
        'assets/mcps',
        'assets/actions'
      ];
      
      for (const dir of requiredDirs) {
        expect(existsSync(join(testProjectRoot, dir))).toBe(true);
      }
    });
  });

  describe('Start Context Command', () => {
    beforeEach(() => {
      // 프로젝트 초기화
      execSync('npx tsx ../../src/cli/index.ts init', { 
        cwd: originalCwd,
        stdio: 'pipe'
      });
    });

    it('should start default context successfully', () => {
      const result = execSync('npx tsx ../../src/cli/index.ts start-context default', { 
        encoding: 'utf8',
        cwd: originalCwd 
      });
      
      expect(result).toContain("Context 'default' started successfully");
    });

    it('should handle non-existent context gracefully', () => {
      try {
        execSync('npx tsx ../../src/cli/index.ts start-context non-existent', { 
          encoding: 'utf8',
          cwd: originalCwd,
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.status).toBe(1);
        expect(error.stderr).toContain('Context file not found');
      }
    });
  });

  describe('Validate Command', () => {
    beforeEach(() => {
      // 프로젝트 초기화
      execSync('npx tsx ../../src/cli/index.ts init', { 
        cwd: originalCwd,
        stdio: 'pipe'
      });
    });

    it('should validate default context successfully', () => {
      const result = execSync('npx tsx ../../src/cli/index.ts validate default', { 
        encoding: 'utf8',
        cwd: originalCwd 
      });
      
      expect(result).toContain('Context "default" and its components are valid');
    });

    it('should detect invalid context files', () => {
      // 잘못된 YAML 파일 생성
      writeFileSync(
        join(testProjectRoot, 'assets', 'invalid-context.yaml'),
        'invalid: yaml: content:\n  - missing quotes'
      );
      
      try {
        execSync('npx tsx ../../src/cli/index.ts validate invalid', { 
          encoding: 'utf8',
          cwd: originalCwd,
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.status).toBe(1);
        expect(error.stderr).toContain('Error parsing YAML file');
      }
    });
  });

  describe('MCP Server Integration', () => {
    it('should inspect MCP server without errors', () => {
      const result = execSync('npx fastmcp inspect ../../mcp-server/server.ts', { 
        encoding: 'utf8',
        cwd: originalCwd,
        timeout: 10000
      });
      
      expect(result).toContain('init');
      expect(result).toContain('start-context');
      expect(result).toContain('validate-context');
    });

    it('should build and inspect compiled server', () => {
      // 먼저 빌드
      execSync('npm run build', { 
        cwd: originalCwd,
        stdio: 'pipe'
      });
      
      const result = execSync('npx fastmcp inspect ../../dist/mcp-server/server.js', { 
        encoding: 'utf8',
        cwd: originalCwd,
        timeout: 10000
      });
      
      expect(result).toContain('init');
      expect(result).toContain('start-context');
      expect(result).toContain('validate-context');
    });
  });

  describe('File System Operations', () => {
    it('should handle file permissions correctly', () => {
      execSync('npx tsx ../../src/cli/index.ts init', { 
        cwd: originalCwd,
        stdio: 'pipe'
      });
      
      // 생성된 파일들이 읽기 가능한지 확인
      const configFiles = [
        'assets/default-context.yaml',
        'assets/personas/software-developer.yaml',
        'assets/rules/the-must-follow.yaml'
      ];
      
      for (const file of configFiles) {
        const filePath = join(testProjectRoot, file);
        expect(existsSync(filePath)).toBe(true);
        
        // 파일 읽기 테스트
        const content = execSync(`cat "${filePath}"`, { encoding: 'utf8' });
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Recovery', () => {
    it('should recover from corrupted config directory', () => {
      // 초기화
      execSync('npx tsx ../../src/cli/index.ts init', { 
        cwd: originalCwd,
        stdio: 'pipe'
      });
      
      // .contextcompose 디렉토리 삭제
      rmSync(join(testProjectRoot, '.contextcompose'), { recursive: true, force: true });
      
      // 다시 초기화 시도
      const result = execSync('npx tsx ../../src/cli/index.ts init', { 
        encoding: 'utf8',
        cwd: originalCwd 
      });
      
      expect(result).toContain('Context Compose initialized successfully');
      expect(existsSync(join(testProjectRoot, '.contextcompose'))).toBe(true);
    });
  });
});
