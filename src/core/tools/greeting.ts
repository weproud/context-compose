import { mkdir, writeFile, access, constants } from 'fs/promises';
import { join } from 'path';
import {
  GreetingToolSchema,
  type GreetingToolInput,
  type GreetingToolResponse,
} from '../../schemas/index.js';

/**
 * 파일명에 적합하도록 이름을 정규화하는 함수
 * 공백과 특수 문자를 dash(-)로 치환하고 소문자로 변환
 */
function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-') // 영문, 숫자, 한글이 아닌 모든 문자를 dash로 치환
    .replace(/-+/g, '-') // 연속된 dash를 하나로 합침
    .replace(/^-|-$/g, ''); // 시작과 끝의 dash 제거
}

/**
 * 기본 greeting YAML 템플릿 생성 함수
 */
function createGreetingYaml(originalName: string, fileName: string): string {
  return `# Task Action Greeting Configuration
name: "${originalName}"
fileName: "${fileName}"
type: "greeting"
created: "${new Date().toISOString()}"

# Greeting Configuration
greeting:
  message: "Hello, ${originalName}!"
  language: "ko"
  enabled: true

# Metadata
metadata:
  description: "Greeting configuration for ${originalName}"
  version: "1.0.0"
  tags:
    - greeting
    - ${fileName}

# Custom Settings
settings:
  showTimestamp: true
  customMessage: ""
`;
}

/**
 * 공통 Greeting 비즈니스 로직
 * CLI와 MCP 서버에서 모두 사용할 수 있는 순수 함수
 */
export class GreetingTool {
  /**
   * 파일이 존재하는지 확인
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Greeting 파일 생성 핵심 로직
   */
  static async execute(
    input: GreetingToolInput
  ): Promise<GreetingToolResponse> {
    const { name, force, configPath } = input;
    const createdFiles: string[] = [];
    const skippedFiles: string[] = [];

    try {
      // 파일명에 적합하도록 이름 정규화
      const normalizedName = normalizeFileName(name);

      // 현재 작업 디렉토리 기준으로 설정 디렉토리 경로 생성
      const configDir = join(process.cwd(), configPath);
      const greetingFile = join(configDir, `hello-${normalizedName}.yaml`);

      // 설정 디렉토리 생성 (없는 경우)
      const dirExists = await this.fileExists(configDir);
      if (!dirExists) {
        await mkdir(configDir, { recursive: true });
        createdFiles.push(configDir);
      }

      // greeting 파일 생성
      const fileExists = await this.fileExists(greetingFile);
      if (fileExists && !force) {
        skippedFiles.push(greetingFile);
      } else {
        const greetingContent = createGreetingYaml(name, normalizedName);
        await writeFile(greetingFile, greetingContent, 'utf8');
        createdFiles.push(greetingFile);
      }

      const message = this.generateSuccessMessage(
        name,
        normalizedName,
        createdFiles,
        skippedFiles,
        force
      );

      return {
        success: true,
        message,
        createdFiles,
        skippedFiles,
        greetingFile,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Greeting 파일 생성 실패: ${errorMessage}`,
        createdFiles,
        skippedFiles,
        greetingFile: join(
          process.cwd(),
          configPath,
          `hello-${normalizeFileName(name)}.yaml`
        ),
      };
    }
  }

  /**
   * 성공 메시지 생성
   */
  private static generateSuccessMessage(
    name: string,
    normalizedName: string,
    createdFiles: string[],
    skippedFiles: string[],
    force: boolean
  ): string {
    const messages: string[] = [];

    if (createdFiles.length > 0) {
      const displayMessage =
        name !== normalizedName
          ? `✅ Greeting "${name}" (파일명: ${normalizedName})이 성공적으로 생성되었습니다!`
          : `✅ Greeting "${name}"이 성공적으로 생성되었습니다!`;
      messages.push(displayMessage);
      messages.push(`생성된 파일: ${createdFiles.length}개`);
      createdFiles.forEach(file => {
        messages.push(`  - ${file}`);
      });
    }

    if (skippedFiles.length > 0) {
      if (force) {
        messages.push(`덮어쓴 파일: ${skippedFiles.length}개`);
      } else {
        messages.push(`⚠️  이미 존재하는 파일: ${skippedFiles.length}개`);
        skippedFiles.forEach(file => {
          messages.push(`  - ${file}`);
        });
        messages.push(`기존 파일을 덮어쓰려면 --force 옵션을 사용하세요.`);
      }
    }

    return messages.join('\n');
  }

  /**
   * 입력 유효성 검사 및 실행
   */
  static async executeWithValidation(
    args: unknown
  ): Promise<GreetingToolResponse> {
    // Zod 스키마로 입력 검증
    const validatedInput = GreetingToolSchema.parse(args);

    // 비즈니스 로직 실행
    return this.execute(validatedInput);
  }

  /**
   * CLI용 헬퍼 함수 - 직접 매개변수 전달
   */
  static async executeFromParams(
    name: string,
    force = false,
    configPath = '.hellomcp'
  ): Promise<GreetingToolResponse> {
    return this.execute({ name, force, configPath });
  }
}

/**
 * 간단한 함수형 인터페이스 (선택사항)
 */
export async function addGreeting(
  name: string,
  force = false,
  configPath = '.hellomcp'
): Promise<GreetingToolResponse> {
  return GreetingTool.executeFromParams(name, force, configPath);
}

/**
 * MCP 도구용 헬퍼 함수
 */
export async function executeGreetingTool(
  args: unknown
): Promise<GreetingToolResponse> {
  return GreetingTool.executeWithValidation(args);
}
