import { FetchUtil } from '../fetch.js';
import { EnvLoader } from '../env.js';
import {
  DiscordToolSchema,
  type DiscordToolInput,
  type DiscordToolResponse,
} from '../../schemas/index.js';

/**
 * Discord webhook payload interface
 */
interface DiscordWebhookPayload {
  content: string;
}

/**
 * Common Discord message sending business logic
 * Pure functions that can be used by both CLI and MCP server
 */
export class DiscordTool {
  /**
   * Discord message sending core logic
   */
  static async execute(input: DiscordToolInput): Promise<DiscordToolResponse> {
    const { message } = input;

    try {
      // Load environment variables from .env file
      EnvLoader.load();

      // Get webhook URL from environment variables
      const webhookUrl = EnvLoader.get('DISCORD_WEBHOOK_URL');

      if (!webhookUrl) {
        return {
          success: false,
          message:
            'Discord Webhook URL is not configured. Please set the DISCORD_WEBHOOK_URL environment variable.',
          sentMessage: {
            content: message,
          },
        };
      }

      // Configure Discord webhook payload
      const payload: DiscordWebhookPayload = {
        content: message,
      };

      // Send POST request to Discord webhook
      const response = await FetchUtil.post<string>(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      return {
        success: true,
        message: `✅ Discord message sent successfully!`,
        discordResponse: response,
        sentMessage: {
          content: message,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to send Discord message: ${errorMessage}`,
        sentMessage: {
          content: message,
        },
      };
    }
  }

  /**
   * Input validation and execution
   */
  static async executeWithValidation(
    args: unknown
  ): Promise<DiscordToolResponse> {
    // Validate input with Zod schema
    const validatedInput = DiscordToolSchema.parse(args);

    // Execute business logic
    return this.execute(validatedInput);
  }

  /**
   * CLI helper function - direct parameter passing
   */
  static async executeFromParams(
    message: string,
    projectRoot: string = process.cwd()
  ): Promise<DiscordToolResponse> {
    return this.execute({ message, projectRoot, enhancedPrompt: false });
  }
}

/**
 * Simple functional interface (optional)
 */
export async function sendDiscordMessage(
  message: string,
  projectRoot: string = process.cwd()
): Promise<DiscordToolResponse> {
  return DiscordTool.executeFromParams(message, projectRoot);
}

/**
 * MCP tool helper function
 */
export async function executeDiscordTool(
  args: unknown
): Promise<DiscordToolResponse> {
  return DiscordTool.executeWithValidation(args);
}
