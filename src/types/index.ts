import { z } from 'zod';

// MCP Tool 관련 타입들
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (args: unknown) => Promise<unknown>;
}

// MCP 자원 타입
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

// 로그 엔트리 타입
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

// CLI 명령 타입
export interface CLICommand {
  name: string;
  description: string;
  action: (...args: unknown[]) => Promise<void>;
}

// 에러 타입
export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MCPError';
  }
}
