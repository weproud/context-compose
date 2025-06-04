import { FastMCP } from 'fastmcp';
import { InitToolSchema } from '../../../src/schemas/init.js';
import { executeInitTool } from '../../../src/core/tools/init.js';
import logger from '../logger.js';

/**
 * Register Init tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerInitTool(server: FastMCP): void {
  server.addTool({
    name: 'init',
    description: 'Task Action 프로젝트를 초기화합니다 (assets 디렉토리를 .taskaction으로 복사)',
    parameters: InitToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info('Init 도구 실행', args as Record<string, unknown>);

        // 공통 비즈니스 로직 사용
        const result = await executeInitTool(args);

        logger.info('Init 도구 완료', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Init 도구 실행 중 오류 발생', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
