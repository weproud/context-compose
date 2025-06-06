import { z } from 'zod';

/**
 * Discord message sending tool input schema
 */
export const DiscordToolSchema = z.object({
  message: z.string().min(1, 'Discord message is required'),
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
 * Discord tool input type
 */
export type DiscordToolInput = z.infer<typeof DiscordToolSchema>;

/**
 * Discord tool response type
 */
export interface DiscordToolResponse {
  success: boolean;
  message: string;
  discordResponse?: string;
  sentMessage: {
    content: string;
  };
}
