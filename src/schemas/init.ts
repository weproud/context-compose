import { z } from 'zod';

/**
 * Init tool schema
 * Defines input parameters for the tool that initializes Task Action projects.
 */
export const InitToolSchema = z.object({
  projectRoot: z
    .string()
    .describe(
      'The root directory for the project. ALWAYS SET THIS TO THE PROJECT ROOT DIRECTORY. IF NOT SET, THE TOOL WILL NOT WORK.'
    ),
  enhancedPrompt: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Use enhanced prompts with detailed guidelines instead of simple prompts'
    ),
});

/**
 * Init tool input type
 */
export type InitToolInput = z.infer<typeof InitToolSchema>;

/**
 * Init tool response type
 */
export interface InitToolResponse {
  success: boolean;
  message: string;
  createdFiles: string[];
  skippedFiles: string[];
}
