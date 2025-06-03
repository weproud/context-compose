import { z } from 'zod';

/**
 * Slack 메시지 전송 도구 입력 스키마
 */
export const SlackToolSchema = z.object({
  message: z.string().min(1, 'Slack 메시지는 필수입니다'),
});

/**
 * Slack 도구 입력 타입
 */
export type SlackToolInput = z.infer<typeof SlackToolSchema>;

/**
 * Slack 도구 응답 타입
 */
export interface SlackToolResponse {
  success: boolean;
  message: string;
  slackResponse?: string;
  sentMessage: {
    text: string;
  };
}
