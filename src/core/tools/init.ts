import {
  mkdir,
  access,
  constants,
  cp,
  readdir,
  stat,
  rename,
} from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  InitToolSchema,
  type InitToolInput,
  type InitToolResponse,
} from '../../schemas/index.js';

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
   * 현재 날짜시간을 yyyyMMddHHmmss 형식으로 반환
   */
  private static getCurrentTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * 기존 디렉토리를 백업
   */
  private static async backupExistingDirectory(
    configDir: string
  ): Promise<string> {
    const timestamp = this.getCurrentTimestamp();
    const backupPath = `${configDir}-${timestamp}`;

    await rename(configDir, backupPath);
    return backupPath;
  }

  /**
   * assets 디렉토리 경로 찾기
   */
  private static async findAssetsDirectory(): Promise<string | null> {
    // MCP 서버가 다른 프로젝트에서 호출될 때를 고려하여
    // task-action 패키지의 assets 디렉토리를 찾습니다

    // 1. 현재 파일의 위치에서 시작하여 task-action 프로젝트의 assets 디렉토리를 찾습니다
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // task-action 프로젝트 루트까지 올라가면서 assets 디렉토리를 찾습니다
    let currentDir = __dirname;
    for (let i = 0; i < 10; i++) {
      // 최대 10단계까지만 올라갑니다
      const assetsPath = join(currentDir, 'assets');
      if (await this.fileExists(assetsPath)) {
        return assetsPath;
      }
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break; // 루트 디렉토리에 도달
      currentDir = parentDir;
    }

    // 2. node_modules에서 task-action 패키지의 assets 디렉토리를 찾습니다
    // (다른 프로젝트에서 task-action을 npm 패키지로 설치한 경우)
    try {
      const nodeModulesPath = join(
        process.cwd(),
        'node_modules',
        'task-action',
        'assets'
      );
      if (await this.fileExists(nodeModulesPath)) {
        return nodeModulesPath;
      }
    } catch (error) {
      // node_modules에서 찾지 못한 경우 무시
    }

    // 3. 전역 node_modules에서 찾기 시도
    try {
      // require.resolve를 사용하여 task-action 패키지 위치 찾기
      const taskActionPath = require.resolve('task-action/package.json');
      const taskActionRoot = dirname(taskActionPath);
      const globalAssetsPath = join(taskActionRoot, 'assets');
      if (await this.fileExists(globalAssetsPath)) {
        return globalAssetsPath;
      }
    } catch (error) {
      // require.resolve 실패 시 무시
    }

    return null;
  }

  /**
   * 디렉토리를 재귀적으로 복사
   */
  private static async copyDirectory(
    src: string,
    dest: string
  ): Promise<string[]> {
    const copiedFiles: string[] = [];

    try {
      // 대상 디렉토리 생성
      await mkdir(dest, { recursive: true });
      copiedFiles.push(dest);

      // 소스 디렉토리의 모든 항목 읽기
      const entries = await readdir(src);

      for (const entry of entries) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);

        const stats = await stat(srcPath);

        if (stats.isDirectory()) {
          // 하위 디렉토리 재귀 복사
          const subFiles = await this.copyDirectory(srcPath, destPath);
          copiedFiles.push(...subFiles);
        } else {
          // 파일 복사
          await cp(srcPath, destPath);
          copiedFiles.push(destPath);
        }
      }
    } catch (error) {
      throw new Error(
        `디렉토리 복사 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return copiedFiles;
  }

  /**
   * Task Action 프로젝트 초기화 핵심 로직
   */
  static async execute(input: InitToolInput): Promise<InitToolResponse> {
    const { configPath } = input;
    const createdFiles: string[] = [];
    const skippedFiles: string[] = [];
    let backupPath: string | null = null;

    try {
      // 현재 작업 디렉토리 기준으로 설정 디렉토리 경로 생성
      const configDir = join(process.cwd(), configPath);

      // assets 디렉토리 찾기
      const assetsDir = await this.findAssetsDirectory();
      if (!assetsDir) {
        throw new Error(
          'task-action의 assets 디렉토리를 찾을 수 없습니다. ' +
            'task-action이 올바르게 설치되었는지 확인해주세요. ' +
            '다음 위치들을 확인했습니다:\n' +
            '1. 현재 프로젝트의 assets 디렉토리\n' +
            '2. node_modules/task-action/assets\n' +
            '3. 전역 설치된 task-action 패키지의 assets 디렉토리'
        );
      }

      // .taskaction 디렉토리가 이미 존재하는지 확인
      const dirExists = await this.fileExists(configDir);
      if (dirExists) {
        // 기존 디렉토리를 백업
        backupPath = await this.backupExistingDirectory(configDir);
        skippedFiles.push(configDir);
      }

      // assets 디렉토리를 .taskaction으로 복사
      const copiedFiles = await this.copyDirectory(assetsDir, configDir);
      createdFiles.push(...copiedFiles);

      const message = this.generateSuccessMessage(
        createdFiles,
        skippedFiles,
        backupPath
      );

      return {
        success: true,
        message,
        createdFiles,
        skippedFiles,
        configPath: configDir,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Task Action 프로젝트 초기화 실패: ${errorMessage}`,
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
    backupPath: string | null
  ): string {
    const messages: string[] = [];

    if (createdFiles.length > 0) {
      messages.push(`✅ Task Action 프로젝트가 성공적으로 초기화되었습니다!`);
      // messages.push(`assets 디렉토리가 .taskaction으로 복사되었습니다.`);
      // messages.push(`생성된 파일/디렉토리: ${createdFiles.length}개`);
      // // 너무 많은 파일 목록을 표시하지 않도록 제한
      // const displayFiles = createdFiles.slice(0, 10);
      // displayFiles.forEach(file => {
      //   messages.push(`  - ${file}`);
      // });
      // if (createdFiles.length > 10) {
      //   messages.push(`  ... 그리고 ${createdFiles.length - 10}개 더`);
      // }
    }

    if (backupPath) {
      messages.push(`📦 기존 디렉토리가 백업되었습니다: ${backupPath}`);
    }

    if (skippedFiles.length > 0 && !backupPath) {
      messages.push(`⚠️  이미 존재하는 디렉토리: ${skippedFiles.length}개`);
      skippedFiles.forEach(file => {
        messages.push(`  - ${file}`);
      });
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
    configPath = '.taskaction'
  ): Promise<InitToolResponse> {
    return this.execute({ configPath });
  }
}

/**
 * 간단한 함수형 인터페이스 (선택사항)
 */
export async function initProject(
  configPath = '.taskaction'
): Promise<InitToolResponse> {
  return InitTool.executeFromParams(configPath);
}

/**
 * MCP 도구용 헬퍼 함수
 */
export async function executeInitTool(
  args: unknown
): Promise<InitToolResponse> {
  return InitTool.executeWithValidation(args);
}
