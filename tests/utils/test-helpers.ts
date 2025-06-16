import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * 테스트 유틸리티 함수들
 */

export interface TestProject {
  root: string;
  assetsDir: string;
  configDir: string;
  cleanup: () => void;
}

/**
 * 임시 테스트 프로젝트 생성
 */
export function createTestProject(prefix = 'test-project'): TestProject {
  const root = join(tmpdir(), `${prefix}-${Date.now()}`);
  const assetsDir = join(root, 'assets');
  const configDir = join(root, '.contextcompose');

  mkdirSync(root, { recursive: true });

  return {
    root,
    assetsDir,
    configDir,
    cleanup: () => {
      if (existsSync(root)) {
        rmSync(root, { recursive: true, force: true });
      }
    }
  };
}

/**
 * 테스트용 컨텍스트 파일 생성
 */
export function createTestContext(
  project: TestProject,
  contextName: string,
  options: {
    personas?: string[];
    rules?: string[];
    mcps?: string[];
    actions?: string[];
    prompt?: string;
    enhancedPrompt?: string;
  } = {}
): void {
  const {
    personas = ['personas/software-developer.yaml'],
    rules = ['rules/the-must-follow.yaml'],
    mcps = ['mcps/sequential-thinking.yaml'],
    actions = [],
    prompt = `This is a test context for ${contextName}.`,
    enhancedPrompt
  } = options;

  const contextContent = {
    version: 1,
    kind: 'context',
    name: contextName,
    description: `Test context for ${contextName}`,
    context: {
      ...(personas.length > 0 && { personas }),
      ...(rules.length > 0 && { rules }),
      ...(mcps.length > 0 && { mcps }),
      ...(actions.length > 0 && { actions })
    },
    prompt,
    ...(enhancedPrompt && { 'enhanced-prompt': enhancedPrompt })
  };

  // YAML 형식으로 변환
  const yamlContent = Object.entries(contextContent)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}:\n${formatYamlObject(value, 2)}`;
      }
      if (typeof value === 'string' && value.includes('\n')) {
        return `${key}: |\n  ${value.split('\n').join('\n  ')}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .join('\n');

  writeFileSync(
    join(project.assetsDir, `${contextName}-context.yaml`),
    yamlContent
  );
}

/**
 * YAML 객체 포맷팅 헬퍼
 */
function formatYamlObject(obj: any, indent: number): string {
  const spaces = ' '.repeat(indent);
  return Object.entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        const items = value.map(item => `${spaces}- ${item}`).join('\n');
        return `${spaces}${key}:\n${items}`;
      }
      if (typeof value === 'object' && value !== null) {
        return `${spaces}${key}:\n${formatYamlObject(value, indent + 2)}`;
      }
      return `${spaces}${key}: ${JSON.stringify(value)}`;
    })
    .join('\n');
}

/**
 * 테스트용 컴포넌트 파일들 생성
 */
export function createTestComponents(project: TestProject): void {
  const components = [
    {
      dir: 'personas',
      files: [
        {
          name: 'software-developer.yaml',
          content: `version: 1
kind: persona
name: software-developer
prompt: You are an experienced software developer.
enhanced-prompt: |
  You are an experienced software developer with expertise in multiple programming languages.
  You write clean, maintainable code and follow best practices.`
        }
      ]
    },
    {
      dir: 'rules',
      files: [
        {
          name: 'the-must-follow.yaml',
          content: `version: 1
kind: rule
name: the-must-follow
prompt: Follow coding best practices and write clean code.
enhanced-prompt: |
  Always follow these essential rules:
  - Write clean, readable code
  - Add proper error handling
  - Include comprehensive tests
  - Document your code properly`
        },
        {
          name: 'development.yaml',
          content: `version: 1
kind: rule
name: development
prompt: Use modern development practices.
enhanced-prompt: |
  Apply modern development practices:
  - Use TypeScript for type safety
  - Implement proper testing strategies
  - Follow SOLID principles
  - Use version control effectively`
        }
      ]
    },
    {
      dir: 'mcps',
      files: [
        {
          name: 'sequential-thinking.yaml',
          content: `version: 1
kind: mcp
name: sequential-thinking
prompt: Use sequential thinking for complex problems.
enhanced-prompt: |
  Break down complex problems into sequential steps:
  - Analyze the problem thoroughly
  - Plan your approach step by step
  - Implement incrementally
  - Test and validate each step`
        }
      ]
    },
    {
      dir: 'actions',
      files: [
        {
          name: 'test.yaml',
          content: `version: 1
kind: action
name: test
prompt: Run comprehensive tests.
enhanced-prompt: |
  Execute a comprehensive testing strategy:
  - Run unit tests
  - Execute integration tests
  - Perform end-to-end testing
  - Generate coverage reports`
        }
      ]
    }
  ];

  for (const component of components) {
    const componentDir = join(project.assetsDir, component.dir);
    mkdirSync(componentDir, { recursive: true });

    for (const file of component.files) {
      writeFileSync(join(componentDir, file.name), file.content);
    }
  }
}

/**
 * CLI 명령어 실행 헬퍼
 */
export function runCLI(
  command: string,
  options: {
    cwd?: string;
    expectSuccess?: boolean;
    timeout?: number;
  } = {}
): { stdout: string; stderr: string; exitCode: number } {
  const { cwd = process.cwd(), expectSuccess = true, timeout = 30000 } = options;
  const cliPath = join(__dirname, '../../src/cli/index.ts');
  const fullCommand = `npx tsx ${cliPath} ${command}`;

  try {
    const stdout = execSync(fullCommand, {
      encoding: 'utf8',
      cwd,
      timeout,
      stdio: 'pipe'
    });

    return {
      stdout,
      stderr: '',
      exitCode: 0
    };
  } catch (error: any) {
    if (expectSuccess) {
      throw error;
    }

    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1
    };
  }
}

/**
 * MCP 서버 검사 헬퍼
 */
export function inspectMCPServer(
  serverPath: string,
  options: { timeout?: number } = {}
): string {
  const { timeout = 15000 } = options;

  try {
    return execSync(`npx fastmcp inspect ${serverPath}`, {
      encoding: 'utf8',
      timeout,
      stdio: 'pipe'
    });
  } catch (error: any) {
    throw new Error(`MCP server inspection failed: ${error.message}`);
  }
}

/**
 * 파일 존재 확인 헬퍼
 */
export function expectFilesToExist(files: string[]): void {
  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`Expected file does not exist: ${file}`);
    }
  }
}

/**
 * 파일 내용 확인 헬퍼
 */
export function expectFileContent(
  filePath: string,
  expectedContent: string | RegExp
): void {
  if (!existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf8');

  if (typeof expectedContent === 'string') {
    if (!content.includes(expectedContent)) {
      throw new Error(
        `File ${filePath} does not contain expected content: ${expectedContent}`
      );
    }
  } else {
    if (!expectedContent.test(content)) {
      throw new Error(
        `File ${filePath} does not match expected pattern: ${expectedContent}`
      );
    }
  }
}

/**
 * 성능 측정 헬퍼
 */
export function measurePerformance<T>(
  fn: () => T,
  maxDuration: number
): { result: T; duration: number } {
  const startTime = Date.now();
  const result = fn();
  const endTime = Date.now();
  const duration = endTime - startTime;

  if (duration > maxDuration) {
    throw new Error(
      `Operation took too long: ${duration}ms (max: ${maxDuration}ms)`
    );
  }

  return { result, duration };
}

/**
 * 비동기 성능 측정 헬퍼
 */
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  maxDuration: number
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  const duration = endTime - startTime;

  if (duration > maxDuration) {
    throw new Error(
      `Async operation took too long: ${duration}ms (max: ${maxDuration}ms)`
    );
  }

  return { result, duration };
}
