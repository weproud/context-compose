import { z } from 'zod';

/**
 * Validate Task Tool Schema
 * Defines the input parameters for the tool that validates task files and related files in a Context Compose project.
 */
export const ValidateTaskToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID is required')
    .describe('The unique identifier of the task to be validated'),
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
 * Validate Task tool input type
 */
export type ValidateTaskToolInput = z.infer<typeof ValidateTaskToolSchema>;

/**
 * Validation result status
 */
export type ValidationStatus = 'pass' | 'fail' | 'warning';

/**
 * Individual validation result
 */
export interface ValidationResult {
  category: string;
  item: string;
  status: ValidationStatus;
  message: string;
}

/**
 * Validation summary information
 */
export interface ValidationSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
}

/**
 * Validate Task tool response type
 */
export interface ValidateTaskToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  validationResults: ValidationResult[];
  summary: ValidationSummary;
}
