import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

/**
 * 환경변수 로드 유틸리티
 * .env 파일에서 환경변수를 로드하고 관리합니다.
 */
export class EnvLoader {
  private static loaded = false;

  /**
   * .env 파일에서 환경변수를 로드합니다.
   * 프로젝트 루트의 .env 파일을 찾아서 로드합니다.
   */
  static load(): void {
    if (this.loaded) return;

    try {
      // 프로젝트 루트에서 .env 파일 찾기
      const envPath = join(process.cwd(), '.env');

      // 간단한 .env 파일 파싱 (dotenv 없이)
      try {
        if (existsSync(envPath)) {
          const envContent = readFileSync(envPath, 'utf8');
          const lines = envContent.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const [key, ...valueParts] = trimmed.split('=');
              if (key && valueParts.length > 0) {
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
              }
            }
          }
          console.log('✅ .env 파일에서 환경변수를 로드했습니다.');
        } else {
          console.warn(
            '⚠️  .env 파일을 찾을 수 없습니다. 환경변수는 시스템에서 로드됩니다.'
          );
        }
      } catch (parseError) {
        console.warn(
          '⚠️  .env 파일 파싱 중 오류 발생. 시스템 환경변수만 사용합니다.'
        );
      }

      this.loaded = true;
    } catch (error) {
      console.warn('⚠️  환경변수 로드 중 오류 발생:', error);
    }
  }

  /**
   * 특정 환경변수 값을 가져옵니다.
   * @param key 환경변수 키
   * @param defaultValue 기본값 (선택사항)
   * @returns 환경변수 값 또는 기본값
   */
  static get(key: string, defaultValue?: string): string | undefined {
    this.load(); // 자동으로 로드
    return process.env[key] || defaultValue;
  }

  /**
   * 필수 환경변수 값을 가져옵니다.
   * 값이 없으면 에러를 발생시킵니다.
   * @param key 환경변수 키
   * @returns 환경변수 값
   * @throws Error 환경변수가 설정되지 않은 경우
   */
  static getRequired(key: string): string {
    this.load(); // 자동으로 로드
    const value = process.env[key];
    if (!value) {
      throw new Error(`필수 환경변수 ${key}가 설정되지 않았습니다.`);
    }
    return value;
  }

  /**
   * 메시징 관련 환경변수들을 확인합니다.
   * @returns 설정된 메시징 서비스 목록
   */
  static checkMessagingConfig(): {
    slack: boolean;
    discord: boolean;
    slackUrl?: string;
    discordUrl?: string;
  } {
    this.load();

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    const discordUrl = process.env.DISCORD_WEBHOOK_URL;

    return {
      slack: !!slackUrl,
      discord: !!discordUrl,
      ...(slackUrl && { slackUrl }),
      ...(discordUrl && { discordUrl }),
    };
  }

  /**
   * 환경변수 설정 상태를 출력합니다.
   */
  static printStatus(): void {
    this.load();

    console.log('🔧 환경변수 설정 상태:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || '미설정'}`);

    const messaging = this.checkMessagingConfig();
    console.log('📤 메시징 설정:');
    console.log(`  Slack: ${messaging.slack ? '✅ 설정됨' : '❌ 미설정'}`);
    console.log(`  Discord: ${messaging.discord ? '✅ 설정됨' : '❌ 미설정'}`);

    if (process.env.OPENWEATHER_API_KEY) {
      console.log(`  OpenWeather API: ✅ 설정됨`);
    } else {
      console.log(`  OpenWeather API: ❌ 미설정`);
    }
  }
}
