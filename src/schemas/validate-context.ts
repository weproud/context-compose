import { z } from 'zod';

/**
 * Validate Context tool schema
 * Defines input parameters for the tool that validates a context and its components.
 */
export const ValidateContextToolSchema = z.object({
  projectRoot: z
    .string()
    .describe('The directory of the project. Must be an absolute path.'),
});

/**
 * Validate Context tool input type
 */
export type ValidateContextToolInput = z.infer<
  typeof ValidateContextToolSchema
>;

/**
 * Represents a single validation error.
 */
export interface ValidationError {
  filePath: string;
  message: string;
  details?: string;
}

/**
 * Validate Context tool response type
 */
export interface ValidateContextToolResponse {
  success: boolean;
  message: string;
  validatedFiles: number;
  errors: ValidationError[];
}
