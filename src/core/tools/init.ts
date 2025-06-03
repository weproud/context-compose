import { mkdir, writeFile, access, constants } from 'fs/promises';
import { join } from 'path';
import {
  InitToolSchema,
  type InitToolInput,
  type InitToolResponse,
} from '../../schemas/index.js';

/**
 * 기본 hello.yaml 설정 내용
 */
const DEFAULT_HELLO_YAML = `# Task Action MCP Configuration
name: "task-action-project"
version: "1.0.0"
description: "Model Context Protocol project configuration"

# MCP Server Configuration
server:
  name: "task-action"
  version: "1.0.0"
  description: "MCP server for this project"

# Tools Configuration
tools:
  - name: "add"
    description: "Add two numbers"
    enabled: true
  - name: "fetchWeather"
    description: "Fetch weather information"
    enabled: true
  - name: "init"
    description: "Initialize MCP project"
    enabled: true

# Resources Configuration
resources:
  - name: "logs"
    uri: "logs://application"
    description: "Application logs"
    enabled: true

# Development Configuration
development:
  inspector: true
  debug: false
`;

/**
 * 공통 Init 비즈니스 로직
 * CLI와 MCP 서버에서 모두 사용할 수 있는 순수 함수
 */
export class InitTool {
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
   * MCP 프로젝트 초기화 핵심 로직
   */
  static async execute(input: InitToolInput): Promise<InitToolResponse> {
    const { force, configPath } = input;
    const createdFiles: string[] = [];
    const skippedFiles: string[] = [];

    try {
      // 현재 작업 디렉토리 기준으로 설정 디렉토리 경로 생성
      const configDir = join(process.cwd(), configPath);
      const configFile = join(configDir, 'hello.yaml');

      // 설정 디렉토리 생성
      const dirExists = await this.fileExists(configDir);
      if (!dirExists) {
        await mkdir(configDir, { recursive: true });
        createdFiles.push(configDir);
      }

      // hello.yaml 파일 생성
      const fileExists = await this.fileExists(configFile);
      if (fileExists && !force) {
        skippedFiles.push(configFile);
      } else {
        await writeFile(configFile, DEFAULT_HELLO_YAML, 'utf8');
        createdFiles.push(configFile);
      }

      const message = this.generateSuccessMessage(createdFiles, skippedFiles, force);

      return {
        success: true,
        message,
        createdFiles,
        skippedFiles,
        configPath: configDir,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `MCP 프로젝트 초기화 실패: ${errorMessage}`,
        createdFiles,
        skippedFiles,
        configPath: join(process.cwd(), configPath),
      };
    }
  }

  /**
   * 성공 메시지 생성
   */
  private static generateSuccessMessage(
    createdFiles: string[],
    skippedFiles: string[],
    force: boolean
  ): string {
    const messages: string[] = [];

    if (createdFiles.length > 0) {
      messages.push(`✅ MCP 프로젝트가 성공적으로 초기화되었습니다!`);
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
  static async executeWithValidation(args: unknown): Promise<InitToolResponse> {
    // Zod 스키마로 입력 검증
    const validatedInput = InitToolSchema.parse(args);

    // 비즈니스 로직 실행
    return this.execute(validatedInput);
  }

  /**
   * CLI용 헬퍼 함수 - 직접 매개변수 전달
   */
  static async executeFromParams(
    force = false,
    configPath = '.hellomcp'
  ): Promise<InitToolResponse> {
    return this.execute({ force, configPath });
  }
}

/**
 * 간단한 함수형 인터페이스 (선택사항)
 */
export async function initProject(
  force = false,
  configPath = '.hellomcp'
): Promise<InitToolResponse> {
  return InitTool.executeFromParams(force, configPath);
}

/**
 * MCP 도구용 헬퍼 함수
 */
export async function executeInitTool(args: unknown): Promise<InitToolResponse> {
  return InitTool.executeWithValidation(args);
}
