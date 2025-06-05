import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type {
  ValidateTaskToolInput,
  ValidateTaskToolResponse,
  ValidationResult,
  ValidationSummary,
  ValidationStatus,
} from '../../schemas/validate-task.js';
import { ValidateTaskToolSchema } from '../../schemas/validate-task.js';

/**
 * Task YAML 파일 구조 타입
 */
interface TaskYaml {
  version?: number;
  kind?: string;
  name?: string;
  description?: string;
  id?: string;
  status?: string;
  jobs?: {
    workflow?: string;
    rules?: string[];
    mcps?: string[];
    [key: string]: string | string[] | undefined;
  };
  prompt?: string;
}

/**
 * Component YAML 파일 구조 타입
 */
interface ComponentYaml {
  version?: number;
  kind?: string;
  name?: string;
  description?: string;
  prompt?: string;
  'prompt-enhanced'?: string;
}

/**
 * Validate Task 도구 핵심 로직
 */
export class ValidateTaskTool {
  /**
   * Task ID 포맷팅 (하이픈 유지)
   */
  static formatTaskId(taskId: string): string {
    return taskId;
  }

  /**
   * Validation 결과 생성 헬퍼
   */
  static createValidationResult(
    category: string,
    item: string,
    status: ValidationStatus,
    message: string
  ): ValidationResult {
    return { category, item, status, message };
  }

  /**
   * 파일 존재성 검사
   */
  static validateTaskFileExists(
    projectRoot: string,
    configPath: string,
    taskId: string
  ): ValidationResult[] {
    const results: ValidationResult[] = [];
    const formattedId = this.formatTaskId(taskId);
    
    // .taskaction 디렉토리 존재 확인
    const configDir = join(projectRoot, configPath);
    if (!existsSync(configDir)) {
      results.push(
        this.createValidationResult(
          'file-existence',
          'config-directory',
          'fail',
          `설정 디렉토리가 존재하지 않습니다: ${configDir}`
        )
      );
      return results;
    }

    results.push(
      this.createValidationResult(
        'file-existence',
        'config-directory',
        'pass',
        `설정 디렉토리가 존재합니다: ${configDir}`
      )
    );

    // Task 파일 존재 확인
    const taskFilePath = join(configDir, `task-${formattedId}.yaml`);
    if (!existsSync(taskFilePath)) {
      results.push(
        this.createValidationResult(
          'file-existence',
          'task-file',
          'fail',
          `Task 파일이 존재하지 않습니다: ${taskFilePath}`
        )
      );
    } else {
      results.push(
        this.createValidationResult(
          'file-existence',
          'task-file',
          'pass',
          `Task 파일이 존재합니다: ${taskFilePath}`
        )
      );
    }

    return results;
  }

  /**
   * YAML 파일 읽기 및 파싱
   */
  static readYamlFile<T = any>(filePath: string): T | null {
    try {
      const content = readFileSync(filePath, 'utf8');
      return parseYaml(content) as T;
    } catch (error) {
      return null;
    }
  }

  /**
   * YAML 구조 및 필수 필드 검사
   */
  static validateYamlStructure(
    projectRoot: string,
    configPath: string,
    taskId: string
  ): ValidationResult[] {
    const results: ValidationResult[] = [];
    const formattedId = this.formatTaskId(taskId);
    const taskFilePath = join(projectRoot, configPath, `task-${formattedId}.yaml`);

    // YAML 파싱 시도
    const taskYaml = this.readYamlFile<TaskYaml>(taskFilePath);
    if (!taskYaml) {
      results.push(
        this.createValidationResult(
          'yaml-structure',
          'parsing',
          'fail',
          'YAML 파일을 파싱할 수 없습니다'
        )
      );
      return results;
    }

    results.push(
      this.createValidationResult(
        'yaml-structure',
        'parsing',
        'pass',
        'YAML 파일이 올바르게 파싱되었습니다'
      )
    );

    // 필수 필드 검사
    const requiredFields = [
      { key: 'version', type: 'number' },
      { key: 'kind', type: 'string' },
      { key: 'name', type: 'string' },
      { key: 'description', type: 'string' },
      { key: 'prompt', type: 'string' },
    ];

    for (const field of requiredFields) {
      const value = taskYaml[field.key as keyof TaskYaml];
      
      if (value === undefined || value === null) {
        results.push(
          this.createValidationResult(
            'required-fields',
            field.key,
            'fail',
            `필수 필드가 누락되었습니다: ${field.key}`
          )
        );
      } else if (field.type === 'number' && typeof value !== 'number') {
        results.push(
          this.createValidationResult(
            'required-fields',
            field.key,
            'fail',
            `필드 타입이 올바르지 않습니다: ${field.key} (expected: ${field.type}, got: ${typeof value})`
          )
        );
      } else if (field.type === 'string' && typeof value !== 'string') {
        results.push(
          this.createValidationResult(
            'required-fields',
            field.key,
            'fail',
            `필드 타입이 올바르지 않습니다: ${field.key} (expected: ${field.type}, got: ${typeof value})`
          )
        );
      } else {
        results.push(
          this.createValidationResult(
            'required-fields',
            field.key,
            'pass',
            `필수 필드가 올바릅니다: ${field.key}`
          )
        );
      }
    }

    // kind 필드 값 검사
    if (taskYaml.kind && taskYaml.kind !== 'task') {
      results.push(
        this.createValidationResult(
          'required-fields',
          'kind-value',
          'warning',
          `kind 필드 값이 'task'가 아닙니다: ${taskYaml.kind}`
        )
      );
    } else if (taskYaml.kind === 'task') {
      results.push(
        this.createValidationResult(
          'required-fields',
          'kind-value',
          'pass',
          `kind 필드 값이 올바릅니다: ${taskYaml.kind}`
        )
      );
    }

    return results;
  }

  /**
   * 참조 파일들 검사
   */
  static validateReferencedFiles(
    projectRoot: string,
    configPath: string,
    taskId: string
  ): ValidationResult[] {
    const results: ValidationResult[] = [];
    const formattedId = this.formatTaskId(taskId);
    const taskFilePath = join(projectRoot, configPath, `task-${formattedId}.yaml`);

    const taskYaml = this.readYamlFile<TaskYaml>(taskFilePath);
    if (!taskYaml || !taskYaml.jobs) {
      results.push(
        this.createValidationResult(
          'referenced-files',
          'jobs-section',
          'fail',
          'jobs 섹션이 존재하지 않습니다'
        )
      );
      return results;
    }

    results.push(
      this.createValidationResult(
        'referenced-files',
        'jobs-section',
        'pass',
        'jobs 섹션이 존재합니다'
      )
    );

    // jobs 섹션의 각 항목 검사
    for (const [sectionName, sectionValue] of Object.entries(taskYaml.jobs)) {
      if (!sectionValue) continue;

      if (typeof sectionValue === 'string') {
        // 단일 파일 (예: workflow)
        const filePath = join(projectRoot, configPath, sectionValue);
        if (!existsSync(filePath)) {
          results.push(
            this.createValidationResult(
              'referenced-files',
              `${sectionName}-file`,
              'fail',
              `참조된 파일이 존재하지 않습니다: ${sectionValue}`
            )
          );
        } else {
          results.push(
            this.createValidationResult(
              'referenced-files',
              `${sectionName}-file`,
              'pass',
              `참조된 파일이 존재합니다: ${sectionValue}`
            )
          );

          // 파일 구조 검사
          const componentResults = this.validateComponentFile(filePath, sectionValue);
          results.push(...componentResults);
        }
      } else if (Array.isArray(sectionValue)) {
        // 파일 배열 (예: rules, mcps)
        for (const filePath of sectionValue) {
          const fullPath = join(projectRoot, configPath, filePath);
          if (!existsSync(fullPath)) {
            results.push(
              this.createValidationResult(
                'referenced-files',
                `${sectionName}-file`,
                'fail',
                `참조된 파일이 존재하지 않습니다: ${filePath}`
              )
            );
          } else {
            results.push(
              this.createValidationResult(
                'referenced-files',
                `${sectionName}-file`,
                'pass',
                `참조된 파일이 존재합니다: ${filePath}`
              )
            );

            // 파일 구조 검사
            const componentResults = this.validateComponentFile(fullPath, filePath);
            results.push(...componentResults);
          }
        }
      }
    }

    return results;
  }

  /**
   * 개별 컴포넌트 파일 검사
   */
  static validateComponentFile(filePath: string, fileName: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    const componentYaml = this.readYamlFile<ComponentYaml>(filePath);
    if (!componentYaml) {
      results.push(
        this.createValidationResult(
          'component-files',
          fileName,
          'fail',
          `컴포넌트 파일을 파싱할 수 없습니다: ${fileName}`
        )
      );
      return results;
    }

    // 컴포넌트 파일의 필수 필드 검사
    const requiredFields = ['version', 'kind', 'name', 'description', 'prompt'];
    
    for (const field of requiredFields) {
      const value = componentYaml[field as keyof ComponentYaml];
      
      if (value === undefined || value === null) {
        results.push(
          this.createValidationResult(
            'component-files',
            `${fileName}-${field}`,
            'warning',
            `컴포넌트 파일의 필수 필드가 누락되었습니다: ${fileName} - ${field}`
          )
        );
      } else {
        results.push(
          this.createValidationResult(
            'component-files',
            `${fileName}-${field}`,
            'pass',
            `컴포넌트 파일의 필수 필드가 존재합니다: ${fileName} - ${field}`
          )
        );
      }
    }

    return results;
  }

  /**
   * Validation 요약 생성
   */
  static createSummary(results: ValidationResult[]): ValidationSummary {
    const total = results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    return { total, passed, failed, warnings };
  }

  /**
   * Validate Task 핵심 로직
   */
  static async execute(input: ValidateTaskToolInput): Promise<ValidateTaskToolResponse> {
    const { taskId, projectRoot, configPath } = input;
    const allResults: ValidationResult[] = [];

    try {
      // 1. 파일 존재성 검사
      const fileExistenceResults = this.validateTaskFileExists(projectRoot, configPath, taskId);
      allResults.push(...fileExistenceResults);

      // Task 파일이 존재하지 않으면 더 이상 진행하지 않음
      const taskFileExists = fileExistenceResults.some(
        r => r.item === 'task-file' && r.status === 'pass'
      );

      if (!taskFileExists) {
        const summary = this.createSummary(allResults);
        return {
          success: false,
          message: `❌ Task '${taskId}' validation 실패: Task 파일이 존재하지 않습니다`,
          taskId,
          validationResults: allResults,
          summary,
        };
      }

      // 2. YAML 구조 및 필수 필드 검사
      const structureResults = this.validateYamlStructure(projectRoot, configPath, taskId);
      allResults.push(...structureResults);

      // 3. 참조 파일들 검사
      const referencedFilesResults = this.validateReferencedFiles(projectRoot, configPath, taskId);
      allResults.push(...referencedFilesResults);

      // 4. 결과 요약
      const summary = this.createSummary(allResults);
      const hasFailures = summary.failed > 0;

      const message = hasFailures
        ? `❌ Task '${taskId}' validation 실패: ${summary.failed}개의 오류가 발견되었습니다`
        : summary.warnings > 0
        ? `⚠️  Task '${taskId}' validation 완료: ${summary.warnings}개의 경고가 있습니다`
        : `✅ Task '${taskId}' validation 성공: 모든 검사를 통과했습니다`;

      return {
        success: !hasFailures,
        message,
        taskId,
        validationResults: allResults,
        summary,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      allResults.push(
        this.createValidationResult(
          'system-error',
          'execution',
          'fail',
          `Validation 실행 중 오류 발생: ${errorMessage}`
        )
      );

      const summary = this.createSummary(allResults);

      return {
        success: false,
        message: `❌ Task '${taskId}' validation 실패: ${errorMessage}`,
        taskId,
        validationResults: allResults,
        summary,
      };
    }
  }

  /**
   * 입력 유효성 검사 및 실행
   */
  static async executeWithValidation(args: unknown): Promise<ValidateTaskToolResponse> {
    // Zod 스키마로 입력 검증
    const validatedInput = ValidateTaskToolSchema.parse(args);

    // 비즈니스 로직 실행
    return this.execute(validatedInput);
  }

  /**
   * CLI용 헬퍼 함수 - 직접 매개변수 전달
   */
  static async executeFromParams(
    taskId: string,
    projectRoot: string,
    configPath = '.taskaction'
  ): Promise<ValidateTaskToolResponse> {
    return this.execute({ taskId, projectRoot, configPath });
  }
}

/**
 * 간단한 함수형 인터페이스 (선택사항)
 */
export async function validateTask(
  taskId: string,
  projectRoot: string,
  configPath = '.taskaction'
): Promise<ValidateTaskToolResponse> {
  return ValidateTaskTool.executeFromParams(taskId, projectRoot, configPath);
}

/**
 * MCP 도구용 헬퍼 함수
 */
export async function executeValidateTaskTool(args: unknown): Promise<ValidateTaskToolResponse> {
  return ValidateTaskTool.executeWithValidation(args);
}
