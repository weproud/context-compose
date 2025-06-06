import { z } from 'zod';

/**
 * Slack message sending tool input schema
 */
export const SlackToolSchema = z.object({
  message: z.string().min(1, 'Slack message is required'),
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
 * Slack tool input type
 */
export type SlackToolInput = z.infer<typeof SlackToolSchema>;

/**
 * Slack tool response type
 */
export interface SlackToolResponse {
  success: boolean;
  message: string;
  slackResponse?: string;
  sentMessage: {
    text: string;
  };
}
