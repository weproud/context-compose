import { z } from 'zod';

/**
 * Get Context tool schema
 * Defines input parameters for the tool that gets context for specific tasks in Task Action projects.
 */
export const GetContextToolSchema = z.object({
  contextId: z
    .string()
    .min(1, 'Context ID is required')
    .describe('Unique identifier for the context to retrieve'),
  projectRoot: z
    .string()
    .describe('The directory of the project. Must be an absolute path.'),
  enhancedPrompt: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Use enhanced prompts with detailed guidelines instead of simple prompts'
    ),
});

/**
 * Get Context tool input type
 */
export type GetContextToolInput = z.infer<typeof GetContextToolSchema>;

/**
 * Get Context tool response type
 */
export interface GetContextToolResponse {
  success: boolean;
  message: string;
  contextId: string;
  combinedPrompt?: string;
  files?: {
    workflow?: string;
    rules?: string[];
    mcps?: string[];
    [key: string]: string | string[] | undefined; // Dynamic section support
  };
}
