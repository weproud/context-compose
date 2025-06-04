import { FastMCP } from 'fastmcp';
import { StartTaskToolSchema } from '../../../src/schemas/start-task.js';
import { executeStartTaskTool } from '../../../src/core/tools/start-task.js';
import logger from '../logger.js';

/**
 * Register Start Task tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerStartTaskTool(server: FastMCP): void {
  server.addTool({
    name: 'start_task',
    description:
      'Task를 시작합니다. task-<task-id>.yaml 파일을 읽어서 workflow, rules, mcps 파일들의 prompt를 조합하여 AI 개발을 위한 컨텍스트를 제공합니다. projectRoot 매개변수로 프로젝트 루트 디렉토리를 지정해야 합니다.',
    parameters: StartTaskToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info('Start Task 도구 실행', args as Record<string, unknown>);

        // 공통 비즈니스 로직 사용
        const result = await executeStartTaskTool(args);

        logger.info('Start Task 도구 완료', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Start Task 도구 실행 중 오류 발생', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
