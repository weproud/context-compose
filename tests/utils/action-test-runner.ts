import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { z } from 'zod';

// Action YAML 스키마 정의
const ActionSchema = z.object({
  version: z.number(),
  kind: z.literal('action'),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  'enhanced-prompt': z.string().optional(),
});

export type Action = z.infer<typeof ActionSchema>;

export interface TestContext {
  action: Action;
  mockServices: MockServices;
  environment: Record<string, string>;
  workingDirectory: string;
}

export interface TestResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  validationResults: ValidationResult[];
}

export interface ValidationResult {
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface MockServices {
  slack: SlackMock;
  discord: DiscordMock;
  git: GitMock;
  filesystem: FileSystemMock;
}

export class ActionTestRunner {
  private mockServices: MockServices;
  private testEnvironment: Record<string, string>;

  constructor() {
    this.mockServices = this.initializeMockServices();
    this.testEnvironment = this.setupTestEnvironment();
  }

  /**
   * 액션 YAML 파일을 로드하고 파싱
   */
  async loadAction(actionPath: string): Promise<Action> {
    try {
      const actionContent = readFileSync(actionPath, 'utf-8');
      const parsedAction = parse(actionContent);
      return ActionSchema.parse(parsedAction);
    } catch (error) {
      throw new Error(`Failed to load action from ${actionPath}: ${error}`);
    }
  }

  /**
   * 개별 액션을 실행하고 결과를 검증
   */
  async runAction(
    actionPath: string,
    testMode: 'mock' | 'integration' | 'e2e' = 'mock',
    customContext?: Partial<TestContext>
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const action = await this.loadAction(actionPath);
      const context = await this.createTestContext(action, testMode, customContext);
      
      // 액션 실행
      const result = await this.executeAction(context, testMode);
      
      // 결과 검증
      const validationResults = await this.validateResult(result, context);
      
      return {
        success: validationResults.every(v => v.type !== 'error'),
        output: result.output,
        executionTime: Date.now() - startTime,
        validationResults,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        validationResults: [{
          type: 'error',
          message: 'Action execution failed',
          details: error,
        }],
      };
    }
  }

  /**
   * 여러 액션을 배치로 테스트
   */
  async runActionSuite(actionPaths: string[]): Promise<Map<string, TestResult>> {
    const results = new Map<string, TestResult>();
    
    for (const actionPath of actionPaths) {
      const result = await this.runAction(actionPath);
      results.set(actionPath, result);
    }
    
    return results;
  }

  private async createTestContext(
    action: Action,
    testMode: string,
    customContext?: Partial<TestContext>
  ): Promise<TestContext> {
    return {
      action,
      mockServices: testMode === 'mock' ? this.mockServices : {} as MockServices,
      environment: { ...this.testEnvironment, ...customContext?.environment },
      workingDirectory: customContext?.workingDirectory || process.cwd(),
    };
  }

  private async executeAction(context: TestContext, testMode: string): Promise<{ output: string }> {
    // 실제 액션 실행 로직은 MCP 서버와 통합하여 구현
    // 여기서는 기본 구조만 제공
    switch (testMode) {
      case 'mock':
        return this.executeMockAction(context);
      case 'integration':
        return this.executeIntegrationAction(context);
      case 'e2e':
        return this.executeE2EAction(context);
      default:
        throw new Error(`Unknown test mode: ${testMode}`);
    }
  }

  private async executeMockAction(context: TestContext): Promise<{ output: string }> {
    // Mock 환경에서 액션 실행 시뮬레이션
    return { output: `Mock execution of ${context.action.name}` };
  }

  private async executeIntegrationAction(context: TestContext): Promise<{ output: string }> {
    // MCP 서버와 통합하여 실제 액션 실행
    return { output: `Integration execution of ${context.action.name}` };
  }

  private async executeE2EAction(context: TestContext): Promise<{ output: string }> {
    // 실제 외부 서비스와 통합하여 E2E 테스트
    return { output: `E2E execution of ${context.action.name}` };
  }

  private async validateResult(result: { output: string }, context: TestContext): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = [];
    
    // 기본 검증 로직
    if (result.output) {
      validations.push({
        type: 'success',
        message: 'Action produced output',
      });
    }
    
    return validations;
  }

  private initializeMockServices(): MockServices {
    return {
      slack: new SlackMock(),
      discord: new DiscordMock(),
      git: new GitMock(),
      filesystem: new FileSystemMock(),
    };
  }

  private setupTestEnvironment(): Record<string, string> {
    return {
      NODE_ENV: 'test',
      SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
      DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/test',
    };
  }
}

// Mock 서비스 클래스들 (기본 구조)
export class SlackMock {
  async sendMessage(message: any): Promise<{ success: boolean; response?: any }> {
    return { success: true, response: { ok: true } };
  }
}

export class DiscordMock {
  async sendMessage(message: any): Promise<{ success: boolean; response?: any }> {
    return { success: true, response: { id: 'mock-message-id' } };
  }
}

export class GitMock {
  async createBranch(branchName: string): Promise<{ success: boolean; output?: string }> {
    return { success: true, output: `Created branch: ${branchName}` };
  }
  
  async commit(message: string): Promise<{ success: boolean; output?: string }> {
    return { success: true, output: `Committed: ${message}` };
  }
}

export class FileSystemMock {
  private mockFiles: Map<string, string> = new Map();
  
  writeFile(path: string, content: string): void {
    this.mockFiles.set(path, content);
  }
  
  readFile(path: string): string | undefined {
    return this.mockFiles.get(path);
  }
}
