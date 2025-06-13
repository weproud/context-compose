import { z } from 'zod';

/**
 * Start Context tool schema
 * Defines input parameters for the tool that starts a context for a task.
 */
export const StartContextToolSchema = z.object({
  contextName: z
    .string()
    .min(1, 'Context name is required')
    .describe('Name of the context to start (e.g., feature, api, test)'),
  projectRoot: z
    .string()
    .describe('The directory of the project. Must be an absolute path.'),
  enhancedPrompt: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Use enhanced prompts with detailed guidelines instead of simple prompts'
    ),
});

/**
 * Start Context tool input type
 */
export type StartContextToolInput = z.infer<typeof StartContextToolSchema>;

/**
 * Start Context tool response type
 */
export interface StartContextToolResponse {
  success: boolean;
  message: string;
  contextName: string;
  combinedPrompt?: string;
  files?: {
    personas?: string[];
    rules?: string[];
    mcps?: string[];
    actions?: string[];
    [key: string]: string | string[] | undefined; // Dynamic section support
  };
}
