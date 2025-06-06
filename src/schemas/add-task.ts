import { z } from 'zod';

/**
 * Add Task tool schema
 * Defines input parameters for the tool that adds new tasks to Task Action projects.
 */
export const AddTaskToolSchema = z.object({
  taskId: z
    .string()
    .min(1, 'Task ID is required')
    .describe('Unique identifier for the task to be created'),
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
 * Add Task tool input type
 */
export type AddTaskToolInput = z.infer<typeof AddTaskToolSchema>;

/**
 * Add Task tool response type
 */
export interface AddTaskToolResponse {
  success: boolean;
  message: string;
  taskId: string;
  fileName: string;
  filePath?: string;
  tasksYamlUpdated?: boolean;
}
