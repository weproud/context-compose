/**
 * Simple logger for MCP server
 */

export function info(
  message: string,
  data: Record<string, unknown> = {}
): void {
  const timestamp = new Date().toISOString();
  console.info(`[${timestamp}] INFO: ${message}`, data);
}

export function warn(
  message: string,
  data: Record<string, unknown> = {}
): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] WARN: ${message}`, data);
}

export function error(
  message: string,
  data: Record<string, unknown> = {}
): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`, data);
}

export function debug(
  message: string,
  data: Record<string, unknown> = {}
): void {
  const timestamp = new Date().toISOString();
  console.debug(`[${timestamp}] DEBUG: ${message}`, data);
}

// For backward compatibility with existing default exports
const logger = { info, warn, error, debug };
export default logger;
