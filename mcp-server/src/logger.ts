/**
 * Structured logger for MCP server
 */

export interface LogData {
  [key: string]: unknown;
}

export function info(message: string, data: LogData = {}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'INFO',
    message,
    ...data,
  };
  console.info(JSON.stringify(logEntry));
}

export function warn(message: string, data: LogData = {}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'WARN',
    message,
    ...data,
  };
  console.warn(JSON.stringify(logEntry));
}

export function error(message: string, data: LogData = {}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    message,
    ...data,
  };
  console.error(JSON.stringify(logEntry));
}

export function debug(message: string, data: LogData = {}): void {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'DEBUG',
      message,
      ...data,
    };
    console.debug(JSON.stringify(logEntry));
  }
}

// Default export for backward compatibility
const logger = { info, warn, error, debug };
export default logger;
