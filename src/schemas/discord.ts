import { z } from 'zod';

/**
 * Discord 메시지 전송 도구 입력 스키마
 */
export const DiscordToolSchema = z.object({
  message: z.string().min(1, 'Discord 메시지는 필수입니다'),
});

/**
 * Discord 도구 입력 타입
 */
export type DiscordToolInput = z.infer<typeof DiscordToolSchema>;

/**
 * Discord 도구 응답 타입
 */
export interface DiscordToolResponse {
  success: boolean;
  message: string;
  discordResponse?: string;
  sentMessage: {
    content: string;
  };
}
