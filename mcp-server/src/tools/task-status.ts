import type { FastMCP } from '@modelcontextprotocol/server-fastmcp';
import { logger } from '../logger.js';
import { executeTaskStatusTool } from '../../../src/core/tools/task-status.js';
import { TaskStatusToolSchema } from '../../../src/schemas/task-status.js';

/**
 * Register Task Status tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerTaskStatusTool(server: FastMCP): void {
  server.addTool({
    name: 'task_status',
    description:
      'Task의 상태를 업데이트합니다 (todo, ready, in-progress, done). 개별 task 파일과 tasks.yaml 파일 모두에서 status를 동기화합니다. projectRoot 매개변수로 프로젝트 루트 디렉토리를 지정해야 합니다.',
    parameters: TaskStatusToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info('Task Status 도구 실행', args as Record<string, unknown>);

        // 공통 비즈니스 로직 사용
        const result = await executeTaskStatusTool(args);

        logger.info('Task Status 도구 완료', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Task Status 도구 실행 중 오류 발생', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
