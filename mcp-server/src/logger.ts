/**
 * Simple logger for MCP server
 */

export function info(
  message: string,
  data: Record<string, unknown> = {}
): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] INFO: ${message}`, data);
}

export function warn(
  message: string,
  data: Record<string, unknown> = {}
): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] WARN: ${message}`, data);
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
  if (process.env.DEBUG) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] DEBUG: ${message}`, data);
  }
}

// 기존 default export와의 호환성을 위한 객체 export
const logger = { info, warn, error, debug };
export default logger;
