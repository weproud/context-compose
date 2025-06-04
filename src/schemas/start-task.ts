import { z } from 'zod';

/**
 * Start Task 도구 스키마
 * Task Action 프로젝트에서 특정 task를 시작하는 도구의 입력 매개변수를 정의합니다.
 */
export const StartTaskToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID는 필수입니다')
    .describe('시작할 task의 고유 식별자'),
  projectRoot: z
    .string()
    .describe('The directory of the project. Must be an absolute path.'),
  configPath: z
    .string()
    .optional()
    .default('.taskaction')
    .describe('설정 디렉토리 경로'),
  enhancedPrompt: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Use enhanced prompts with detailed guidelines instead of simple prompts'
    ),
});

/**
 * Start Task 도구 입력 타입
 */
export type StartTaskToolInput = z.infer<typeof StartTaskToolSchema>;

/**
 * Start Task 도구 응답 타입
 */
export interface StartTaskToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  combinedPrompt?: string;
  files?: {
    workflow?: string | undefined;
    rules: string[];
    mcps: string[];
  };
}
