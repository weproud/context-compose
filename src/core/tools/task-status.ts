import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type {
  TaskStatusToolInput,
  TaskStatusToolResponse,
} from '../../schemas/task-status.js';
import { TaskStatusToolSchema } from '../../schemas/task-status.js';

/**
 * Task YAML file structure type
 */
interface TaskYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  id: string;
  status: string;
  jobs: {
    workflow?: string;
    rules?: string[];
    mcps?: string[];
    [key: string]: string | string[] | undefined;
  };
  prompt?: string;
}

/**
 * Tasks List YAML 파일 구조 타입
 */
interface TasksListYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  tasks: Array<{
    id: string;
    status: string;
  }>;
}

/**
 * Task Status 업데이트 도구 클래스
 */
export class TaskStatusTool {
  /**
   * Task Status 업데이트 실행
   */
  static async executeFromParams(
    taskId: string,
    status: string,
    projectRoot: string,
    configPath: string = '.taskaction'
  ): Promise<TaskStatusToolResponse> {
    const input: TaskStatusToolInput = {
      taskId,
      status: status as 'todo' | 'ready' | 'in-progress' | 'done',
      projectRoot,
      configPath,
    };

    return await updateTaskStatus(input);
  }
}

/**
 * Task Status 업데이트 함수
 */
export async function updateTaskStatus(
  input: TaskStatusToolInput
): Promise<TaskStatusToolResponse> {
  try {
    // 입력 검증
    const validatedInput = TaskStatusToolSchema.parse(input);
    const { taskId, status, projectRoot, configPath } = validatedInput;

    const configDir = join(projectRoot, configPath);
    const updatedFiles: string[] = [];

    // 1. 개별 task 파일 업데이트
    const taskFileName = `task-${taskId}.yaml`;
    const taskFilePath = join(configDir, taskFileName);

    if (!existsSync(taskFilePath)) {
      throw new Error(`Task 파일을 찾을 수 없습니다: ${taskFilePath}`);
    }

    // Task 파일 읽기 및 업데이트
    const taskFileContent = readFileSync(taskFilePath, 'utf-8');
    const taskYaml: TaskYaml = parseYaml(taskFileContent);

    // Status 업데이트
    taskYaml.status = status;

    // Task 파일 저장
    const updatedTaskContent = stringifyYaml(taskYaml, {
      lineWidth: 0,
      minContentWidth: 0,
    });
    writeFileSync(taskFilePath, updatedTaskContent, 'utf-8');
    updatedFiles.push(taskFilePath);

    // 2. tasks.yaml 파일 업데이트
    const tasksFilePath = join(configDir, 'tasks.yaml');

    if (existsSync(tasksFilePath)) {
      const tasksFileContent = readFileSync(tasksFilePath, 'utf-8');
      const tasksYaml: TasksListYaml = parseYaml(tasksFileContent);

      // 해당 task 찾기 및 업데이트
      const taskIndex = tasksYaml.tasks.findIndex(task => task.id === taskId);

      if (taskIndex !== -1) {
        // 기존 task 업데이트
        tasksYaml.tasks[taskIndex]!.status = status;
      } else {
        // 새로운 task 추가
        tasksYaml.tasks.push({
          id: taskId,
          status: status,
        });
      }

      // tasks.yaml 파일 저장
      const updatedTasksContent = stringifyYaml(tasksYaml, {
        lineWidth: 0,
        minContentWidth: 0,
      });
      writeFileSync(tasksFilePath, updatedTasksContent, 'utf-8');
      updatedFiles.push(tasksFilePath);
    }

    return {
      success: true,
      message: `Task "${taskId}"의 상태가 "${status}"로 업데이트되었습니다.`,
      taskId,
      status,
      updatedFiles,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Task Status 업데이트 실패: ${errorMessage}`,
      taskId: input.taskId,
      status: input.status,
      updatedFiles: [],
    };
  }
}

/**
 * Task Status 도구 실행 함수 (MCP 서버용)
 */
export async function executeTaskStatusTool(
  args: unknown
): Promise<TaskStatusToolResponse> {
  const input = TaskStatusToolSchema.parse(args);
  return await updateTaskStatus(input);
}
