#!/usr/bin/env node

import ContextComposeServer from './src/index.js';
import logger from './src/logger.js';

/**
 * Start the MCP server
 */
async function startServer(): Promise<void> {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start MCP server: ${errorMessage}`);
    process.exit(1);
  }
}

// Start the server
startServer();
