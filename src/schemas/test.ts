import { z } from 'zod';

/**
 * 공통 테스트 도구 베이스 스키마
 */
const BaseTestToolSchema = z.object({
  projectRoot: z
    .string()
    .describe(
      'The root directory for the project. ALWAYS SET THIS TO THE PROJECT ROOT DIRECTORY. IF NOT SET, THE TOOL WILL NOT WORK.'
    ),
  dryRun: z
    .boolean()
    .optional()
    .default(false)
    .describe('Perform dry run without actual execution'),
  verbose: z
    .boolean()
    .optional()
    .default(false)
    .describe('Enable verbose output'),
  cleanup: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Whether to cleanup test artifacts after execution (default: true). Set to false to keep created branches/files.'
    ),
  branchName: z
    .string()
    .optional()
    .describe(
      'Custom branch name for create-branch action. If not provided, auto-generated name will be used.'
    ),
});

/**
 * Test Action 도구 스키마
 * Task Action의 actions를 실제 환경에서 테스트하는 도구의 입력 매개변수를 정의합니다.
 */
export const TestActionToolSchema = BaseTestToolSchema.extend({
  testTarget: z
    .string()
    .describe(
      'Test target in format: <action-name> or actions/<action-name> (e.g., create-branch, actions/create-branch, git-commit). When using simple name, searches in assets/actions first, then .taskaction/actions'
    ),
});

/**
 * Test Notify 도구 스키마
 * Task Action의 notifications를 실제 환경에서 테스트하는 도구의 입력 매개변수를 정의합니다.
 */
export const TestNotifyToolSchema = BaseTestToolSchema.extend({
  testTarget: z
    .string()
    .describe(
      'Test target in format: <notify-name> or notify/<notify-name> (e.g., slack-send-message, notify/slack-send-message, discord-send-message). When using simple name, searches in assets/notify first, then .taskaction/notify'
    ),
});

/**
 * Test 도구 스키마 (기존 호환성을 위해 유지, deprecated)
 * Task Action의 actions와 notifications를 실제 환경에서 테스트하는 도구의 입력 매개변수를 정의합니다.
 */
export const TestToolSchema = BaseTestToolSchema.extend({
  testTarget: z
    .string()
    .describe('Test target in format: actions/<n> or notify/<n>'),
});

/**
 * List Tests 도구 스키마
 * 사용 가능한 actions와 notifications 목록을 조회하는 도구의 입력 매개변수를 정의합니다.
 */
export const ListTestsToolSchema = z.object({
  type: z
    .enum(['actions', 'notify', 'all'])
    .optional()
    .default('all')
    .describe('Type of tests to list'),
  projectRoot: z
    .string()
    .describe(
      'The root directory for the project. ALWAYS SET THIS TO THE PROJECT ROOT DIRECTORY. IF NOT SET, THE TOOL WILL NOT WORK.'
    ),
});

/**
 * Check Test Environment 도구 스키마
 * 테스트 환경이 올바르게 구성되어 있는지 확인하는 도구의 입력 매개변수를 정의합니다.
 */
export const CheckTestEnvToolSchema = z.object({
  checkType: z
    .enum(['all', 'slack', 'discord', 'git'])
    .optional()
    .default('all')
    .describe('Type of environment check'),
  projectRoot: z
    .string()
    .describe(
      'The root directory for the project. ALWAYS SET THIS TO THE PROJECT ROOT DIRECTORY. IF NOT SET, THE TOOL WILL NOT WORK.'
    ),
});

/**
 * Test Action 도구 입력 타입
 */
export type TestActionToolInput = z.infer<typeof TestActionToolSchema>;

/**
 * Test Notify 도구 입력 타입
 */
export type TestNotifyToolInput = z.infer<typeof TestNotifyToolSchema>;

/**
 * Test 도구 입력 타입 (기존 호환성을 위해 유지, deprecated)
 */
export type TestToolInput = z.infer<typeof TestToolSchema>;

/**
 * List Tests 도구 입력 타입
 */
export type ListTestsToolInput = z.infer<typeof ListTestsToolSchema>;

/**
 * Check Test Environment 도구 입력 타입
 */
export type CheckTestEnvToolInput = z.infer<typeof CheckTestEnvToolSchema>;

/**
 * Test 도구 응답 타입
 */
export interface TestToolResponse {
  success: boolean;
  message: string;
  testTarget?: string;
  executionTime?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * List Tests 도구 응답 타입
 */
export interface ListTestsToolResponse {
  message: string;
  timestamp: string;
  actions?: string[];
  notify?: string[];
  examples?: string[];
  environmentVariables?: {
    required: string[];
    optional: string[];
  };
}

/**
 * Check Test Environment 도구 응답 타입
 */
export interface CheckTestEnvToolResponse {
  success: boolean;
  message: string;
  timestamp: string;
  checks?: Record<
    string,
    {
      status: 'pass' | 'fail' | 'warning';
      message: string;
    }
  >;
}
