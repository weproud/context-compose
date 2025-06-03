import { z } from 'zod';

/**
 * Greeting 도구 입력 스키마
 */
export const GreetingToolSchema = z.object({
  name: z.string().min(1, 'Greeting 이름은 필수입니다'),
  force: z.boolean().optional().default(false),
  configPath: z.string().optional().default('.hellomcp'),
});

/**
 * Greeting 도구 입력 타입
 */
export type GreetingToolInput = z.infer<typeof GreetingToolSchema>;

/**
 * Greeting 도구 응답 타입
 */
export interface GreetingToolResponse {
  success: boolean;
  message: string;
  createdFiles: string[];
  skippedFiles: string[];
  greetingFile: string;
}
