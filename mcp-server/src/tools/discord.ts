import { FastMCP } from 'fastmcp';
import { DiscordToolSchema } from '../../../src/schemas/discord.js';
import { executeDiscordTool } from '../../../src/core/tools/discord.js';
import logger from '../logger.js';

/**
 * Register Discord tool with MCP server
 * @param server - FastMCP server instance
 */
export function registerDiscordTool(server: FastMCP): void {
  server.addTool({
    name: 'send_message_discord',
    description:
      'Discord로 메시지를 전송합니다 (DISCORD_WEBHOOK_URL 환경변수 필요)',
    parameters: DiscordToolSchema,
    execute: async (args: unknown) => {
      try {
        logger.info('Discord 도구 실행', args as Record<string, unknown>);

        // 공통 비즈니스 로직 사용
        const result = await executeDiscordTool(args);

        logger.info('Discord 도구 완료', { result });

        return JSON.stringify(result);
      } catch (error) {
        logger.error('Discord 도구 실행 중 오류 발생', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
