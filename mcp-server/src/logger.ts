/**
 * Simple logger for MCP server
 */
class Logger {
  static info(message: string, data: Record<string, unknown> = {}): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] INFO: ${message}`, data);
  }

  static warn(message: string, data: Record<string, unknown> = {}): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] WARN: ${message}`, data);
  }

  static error(message: string, data: Record<string, unknown> = {}): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, data);
  }

  static debug(message: string, data: Record<string, unknown> = {}): void {
    if (process.env.DEBUG) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] DEBUG: ${message}`, data);
    }
  }
}

export default Logger;
