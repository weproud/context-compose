/**
 * 모든 MCP 도구 스키마를 export하는 중앙 집중식 파일
 */

// Init 도구 스키마
export {
  InitToolSchema,
  type InitToolInput,
  type InitToolResponse,
} from './init.js';

// Slack 도구 스키마
export {
  SlackToolSchema,
  type SlackToolInput,
  type SlackToolResponse,
} from './slack.js';

// Discord 도구 스키마
export {
  DiscordToolSchema,
  type DiscordToolInput,
  type DiscordToolResponse,
} from './discord.js';
