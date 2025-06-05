import { z } from 'zod';

/**
 * Task Status 도구 입력 스키마
 */
export const TaskStatusToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID는 필수입니다')
    .describe('업데이트할 Task ID'),
  status: z
    .enum(['todo', 'ready', 'in-progress', 'done'])
    .describe('설정할 Task 상태 (todo, ready, in-progress, done)'),
  projectRoot: z
    .string()
    .min(1, '프로젝트 루트 디렉토리는 필수입니다')
    .describe('프로젝트 루트 디렉토리 (절대 경로)'),
  configPath: z
    .string()
    .default('.taskaction')
    .describe('설정 디렉토리 경로 (기본값: .taskaction)'),
});

/**
 * Task Status 도구 입력 타입
 */
export type TaskStatusToolInput = z.infer<typeof TaskStatusToolSchema>;

/**
 * Task Status 도구 응답 타입
 */
export interface TaskStatusToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  status: string;
  updatedFiles: string[];
}
