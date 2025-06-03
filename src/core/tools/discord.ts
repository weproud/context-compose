import { FetchUtil } from '../fetch.js';
import { EnvLoader } from '../env.js';
import {
  DiscordToolSchema,
  type DiscordToolInput,
  type DiscordToolResponse,
} from '../../schemas/index.js';

/**
 * Discord webhook 페이로드 인터페이스
 */
interface DiscordWebhookPayload {
  content: string;
}

/**
 * 공통 Discord 메시지 전송 비즈니스 로직
 * CLI와 MCP 서버에서 모두 사용할 수 있는 순수 함수
 */
export class DiscordTool {
  /**
   * Discord 메시지 전송 핵심 로직
   */
  static async execute(input: DiscordToolInput): Promise<DiscordToolResponse> {
    const { message } = input;

    try {
      // .env 파일에서 환경변수 로드
      EnvLoader.load();

      // Webhook URL 환경변수에서 가져오기
      const webhookUrl = EnvLoader.get('DISCORD_WEBHOOK_URL');

      if (!webhookUrl) {
        return {
          success: false,
          message:
            'Discord Webhook URL이 설정되지 않았습니다. DISCORD_WEBHOOK_URL 환경변수를 설정해주세요.',
          sentMessage: {
            content: message,
          },
        };
      }

      // Discord webhook 페이로드 구성
      const payload: DiscordWebhookPayload = {
        content: message,
      };

      // Discord webhook으로 POST 요청 전송
      const response = await FetchUtil.post<string>(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10초 타임아웃
      });

      return {
        success: true,
        message: `✅ Discord 메시지가 성공적으로 전송되었습니다!`,
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
        message: `Discord 메시지 전송 실패: ${errorMessage}`,
        sentMessage: {
          content: message,
        },
      };
    }
  }

  /**
   * 입력 유효성 검사 및 실행
   */
  static async executeWithValidation(
    args: unknown
  ): Promise<DiscordToolResponse> {
    // Zod 스키마로 입력 검증
    const validatedInput = DiscordToolSchema.parse(args);

    // 비즈니스 로직 실행
    return this.execute(validatedInput);
  }

  /**
   * CLI용 헬퍼 함수 - 직접 매개변수 전달
   */
  static async executeFromParams(
    message: string
  ): Promise<DiscordToolResponse> {
    return this.execute({ message });
  }
}

/**
 * 간단한 함수형 인터페이스 (선택사항)
 */
export async function sendDiscordMessage(
  message: string
): Promise<DiscordToolResponse> {
  return DiscordTool.executeFromParams(message);
}

/**
 * MCP 도구용 헬퍼 함수
 */
export async function executeDiscordTool(
  args: unknown
): Promise<DiscordToolResponse> {
  return DiscordTool.executeWithValidation(args);
}
