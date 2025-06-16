import { Command } from 'commander';
import ContextComposeServer from '../../../mcp-server/src/index.js';
import logger from '../../../mcp-server/src/logger.js';

export function registerServeCommand(program: Command) {
  program
    .command('serve')
    .description('Starts the MCP server.')
    .action(async () => {
      logger.info('Starting MCP server...');
      const server = new ContextComposeServer();

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await server.stop();
        process.exit(0);
      });

      try {
        await server.start();
        logger.info('MCP server started successfully.');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Failed to start MCP server: ${errorMessage}`);
        process.exit(1);
      }
    });
}
