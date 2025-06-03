import { z } from 'zod';

/**
 * Init 도구 스키마
 * MCP 프로젝트를 초기화하는 도구의 입력 매개변수를 정의합니다.
 */
export const InitToolSchema = z.object({
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe('기존 파일을 덮어쓸지 여부'),
  configPath: z
    .string()
    .optional()
    .default('.hellomcp')
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
