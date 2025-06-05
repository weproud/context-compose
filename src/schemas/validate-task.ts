import { z } from 'zod';

/**
 * Validate Task 도구 스키마
 * Task Action 프로젝트의 task 파일과 관련 파일들의 유효성을 검사하는 도구의 입력 매개변수를 정의합니다.
 */
export const ValidateTaskToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID는 필수입니다')
    .describe('검증할 task의 고유 식별자'),
  projectRoot: z
    .string()
    .describe('The directory of the project. Must be an absolute path.'),
  configPath: z
    .string()
    .optional()
    .default('.taskaction')
    .describe('설정 디렉토리 경로'),
});

/**
 * Validate Task 도구 입력 타입
 */
export type ValidateTaskToolInput = z.infer<typeof ValidateTaskToolSchema>;

/**
 * Validation 결과 상태
 */
export type ValidationStatus = 'pass' | 'fail' | 'warning';

/**
 * 개별 Validation 결과
 */
export interface ValidationResult {
  category: string;
  item: string;
  status: ValidationStatus;
  message: string;
}

/**
 * Validation 요약 정보
 */
export interface ValidationSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
}

/**
 * Validate Task 도구 응답 타입
 */
export interface ValidateTaskToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  validationResults: ValidationResult[];
  summary: ValidationSummary;
}
