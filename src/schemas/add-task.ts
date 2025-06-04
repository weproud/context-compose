import { z } from 'zod';

/**
 * Add Task 도구 스키마
 * Task Action 프로젝트에 새로운 task를 추가하는 도구의 입력 매개변수를 정의합니다.
 */
export const AddTaskToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID는 필수입니다')
    .describe('생성할 task의 고유 식별자'),
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
 * Add Task 도구 입력 타입
 */
export type AddTaskToolInput = z.infer<typeof AddTaskToolSchema>;

/**
 * Add Task 도구 응답 타입
 */
export interface AddTaskToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  fileName: string;
  filePath?: string;
  tasksYamlUpdated?: boolean;
}
