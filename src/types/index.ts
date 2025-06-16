import type { z } from 'zod';

// MCP Tool related types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (_args: unknown) => Promise<unknown>;
}

// MCP resource type
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

// Log entry type
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

// CLI command type
export interface CLICommand {
  name: string;
  description: string;
  action: (..._args: unknown[]) => Promise<void>;
}
