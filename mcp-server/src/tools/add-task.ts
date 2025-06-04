import { FastMCP } from 'fastmcp';
import { AddTaskToolSchema } from '../../../src/schemas/add-task.js';
import { executeAddTaskTool } from '../../../src/core/tools/add-task.js';
import logger from '../logger.js';

/**
 * Register Add Task tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerAddTaskTool(server: FastMCP): void {
  server.addTool({
    name: 'add_task',
    description:
      '새로운 Task 파일을 생성합니다 (.taskaction/task-template.yaml을 템플릿으로 사용). projectRoot 매개변수로 프로젝트 루트 디렉토리를 지정해야 합니다.',
    parameters: AddTaskToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info('Add Task 도구 실행', args as Record<string, unknown>);

        // 공통 비즈니스 로직 사용
        const result = await executeAddTaskTool(args);

        logger.info('Add Task 도구 완료', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Add Task 도구 실행 중 오류 발생', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
