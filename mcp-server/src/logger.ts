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
  process.stderr.write(JSON.stringify(logEntry) + '\n');
}

export function warn(message: string, data: LogData = {}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'WARN',
    message,
    ...data,
  };
  process.stderr.write(JSON.stringify(logEntry) + '\n');
}

export function error(message: string, data: LogData = {}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    message,
    ...data,
  };
  process.stderr.write(JSON.stringify(logEntry) + '\n');
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
    process.stderr.write(JSON.stringify(logEntry) + '\n');
  }
}

// Default export for backward compatibility
const logger = { info, warn, error, debug };
export default logger;
