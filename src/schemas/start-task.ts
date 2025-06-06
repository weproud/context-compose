import { z } from 'zod';

/**
 * Start Task tool schema
 * Defines input parameters for the tool that starts specific tasks in Task Action projects.
 */
export const StartTaskToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID is required')
    .describe('Unique identifier for the task to start'),
  projectRoot: z
    .string()
    .describe('The directory of the project. Must be an absolute path.'),
  configPath: z
    .string()
    .optional()
    .default('.taskaction')
    .describe('Configuration directory path'),
  enhancedPrompt: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Use enhanced prompts with detailed guidelines instead of simple prompts'
    ),
});

/**
 * Start Task tool input type
 */
export type StartTaskToolInput = z.infer<typeof StartTaskToolSchema>;

/**
 * Start Task tool response type
 */
export interface StartTaskToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  combinedPrompt?: string;
  files?: {
    workflow?: string;
    rules?: string[];
    mcps?: string[];
    [key: string]: string | string[] | undefined; // Dynamic section support
  };
}
