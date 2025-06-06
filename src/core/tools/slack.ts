import { FetchUtil } from '../fetch.js';
import { EnvLoader } from '../env.js';
import {
  SlackToolSchema,
  type SlackToolInput,
  type SlackToolResponse,
} from '../../schemas/index.js';

/**
 * Slack webhook payload interface
 */
interface SlackWebhookPayload {
  text: string;
}

/**
 * Common Slack message sending business logic
 * Pure functions that can be used by both CLI and MCP server
 */
export class SlackTool {
  /**
   * Slack message sending core logic
   */
  static async execute(input: SlackToolInput): Promise<SlackToolResponse> {
    const { message } = input;

    try {
      // Load environment variables from .env file
      EnvLoader.load();

      // Get webhook URL from environment variables
      const webhookUrl = EnvLoader.get('SLACK_WEBHOOK_URL');

      if (!webhookUrl) {
        return {
          success: false,
          message:
            'Slack Webhook URL is not configured. Please set the SLACK_WEBHOOK_URL environment variable.',
          sentMessage: {
            text: message,
          },
        };
      }

      // Configure Slack webhook payload
      const payload: SlackWebhookPayload = {
        text: message,
      };

      // Send POST request to Slack webhook
      const response = await FetchUtil.post<string>(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      return {
        success: true,
        message: `✅ Slack message sent successfully!`,
        slackResponse: response,
        sentMessage: {
          text: message,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to send Slack message: ${errorMessage}`,
        sentMessage: {
          text: message,
        },
      };
    }
  }

  /**
   * Input validation and execution
   */
  static async executeWithValidation(
    args: unknown
  ): Promise<SlackToolResponse> {
    // Validate input with Zod schema
    const validatedInput = SlackToolSchema.parse(args);

    // Execute business logic
    return this.execute(validatedInput);
  }

  /**
   * CLI helper function - direct parameter passing
   */
  static async executeFromParams(
    message: string,
    projectRoot: string = process.cwd()
  ): Promise<SlackToolResponse> {
    return this.execute({ message, projectRoot, enhancedPrompt: false });
  }
}

/**
 * Simple functional interface (optional)
 */
export async function sendSlackMessage(
  message: string,
  projectRoot: string = process.cwd()
): Promise<SlackToolResponse> {
  return SlackTool.executeFromParams(message, projectRoot);
}

/**
 * MCP tool helper function
 */
export async function executeSlackTool(
  args: unknown
): Promise<SlackToolResponse> {
  return SlackTool.executeWithValidation(args);
}
