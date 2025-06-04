import { z } from 'zod';

/**
 * Init 도구 스키마
 * Task Action 프로젝트를 초기화하는 도구의 입력 매개변수를 정의합니다.
 */
export const InitToolSchema = z.object({
  configPath: z
    .string()
    .optional()
    .default('.taskaction')
    .describe('설정 디렉토리 경로'),
});

/**
 * Init 도구 입력 타입
 */
export type InitToolInput = z.infer<typeof InitToolSchema>;

/**
 * Init 도구 응답 타입
 */
export interface InitToolResponse {
  success: boolean;
  message: string;
  createdFiles: string[];
  skippedFiles: string[];
  configPath: string;
}
