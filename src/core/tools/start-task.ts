import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type {
  StartTaskToolInput,
  StartTaskToolResponse,
} from '../../schemas/start-task.js';
import { StartTaskToolSchema } from '../../schemas/start-task.js';

/**
 * Task YAML 파일 구조 타입
 */
interface TaskYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  id: string;
  status: string;
  jobs: {
    workflow?: string;
    rules?: string[];
    mcps?: string[];
    [key: string]: string | string[] | undefined; // 동적 섹션 지원
  };
  prompt?: string;
}

/**
 * Workflow/Rule/MCP YAML 파일 구조 타입
 */
interface ComponentYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  prompt: string;
  'prompt-enhanced'?: string;
}

/**
 * Start Task 도구 핵심 로직
 */
export class StartTaskTool {
  /**
   * Task ID 포맷팅 (하이픈을 언더스코어로 변경)
   */
  static formatTaskId(taskId: string): string {
    return taskId.replace(/-/g, '_');
  }

  /**
   * YAML 파일 읽기 및 파싱
   */
  static readYamlFile<T = ComponentYaml>(filePath: string): T {
    if (!existsSync(filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const parsed = parseYaml(content) as T;
      return parsed;
    } catch (error) {
      throw new Error(
        `YAML 파일 파싱 실패 (${filePath}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Task 파일 읽기
   */
  static readTaskFile(
    projectRoot: string,
    configPath: string,
    taskId: string
  ): TaskYaml {
    const formattedId = this.formatTaskId(taskId);
    const taskFilePath = join(
      projectRoot,
      configPath,
      `task-${formattedId}.yaml`
    );

    return this.readYamlFile<TaskYaml>(taskFilePath);
  }

  /**
   * Workflow 파일 읽기
   */
  static readWorkflowFile(
    projectRoot: string,
    configPath: string,
    workflowPath: string
  ): ComponentYaml {
    const fullPath = join(projectRoot, configPath, workflowPath);
    return this.readYamlFile(fullPath);
  }

  /**
   * Rules 파일들 읽기
   */
  static readRulesFiles(
    projectRoot: string,
    configPath: string,
    rulesPaths: string[]
  ): ComponentYaml[] {
    return rulesPaths.map(rulePath => {
      const fullPath = join(projectRoot, configPath, rulePath);
      return this.readYamlFile(fullPath);
    });
  }

  /**
   * MCPs 파일들 읽기
   */
  static readMcpsFiles(
    projectRoot: string,
    configPath: string,
    mcpsPaths: string[]
  ): ComponentYaml[] {
    return mcpsPaths.map(mcpPath => {
      const fullPath = join(projectRoot, configPath, mcpPath);
      return this.readYamlFile(fullPath);
    });
  }

  /**
   * 컴포넌트 파일들 읽기 (범용)
   */
  static readComponentFiles(
    projectRoot: string,
    configPath: string,
    filePaths: string[]
  ): ComponentYaml[] {
    return filePaths.map(filePath => {
      const fullPath = join(projectRoot, configPath, filePath);
      return this.readYamlFile(fullPath);
    });
  }

  /**
   * 단일 컴포넌트 파일 읽기 (범용)
   */
  static readComponentFile(
    projectRoot: string,
    configPath: string,
    filePath: string
  ): ComponentYaml {
    const fullPath = join(projectRoot, configPath, filePath);
    return this.readYamlFile(fullPath);
  }

  /**
   * Jobs 섹션 처리 - 동적으로 모든 섹션을 처리
   */
  static processJobsSection(
    projectRoot: string,
    configPath: string,
    jobs: TaskYaml['jobs']
  ): Record<string, ComponentYaml[]> {
    const processedSections: Record<string, ComponentYaml[]> = {};

    for (const [sectionName, sectionValue] of Object.entries(jobs)) {
      if (!sectionValue) continue;

      try {
        if (typeof sectionValue === 'string') {
          // 단일 파일 (예: workflow)
          const component = this.readComponentFile(
            projectRoot,
            configPath,
            sectionValue
          );
          processedSections[sectionName] = [component];
        } else if (Array.isArray(sectionValue)) {
          // 파일 배열 (예: rules, mcps, notify, issue 등)
          const components = this.readComponentFiles(
            projectRoot,
            configPath,
            sectionValue
          );
          processedSections[sectionName] = components;
        }
      } catch (error) {
        console.warn(
          `⚠️  ${sectionName} 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
        );
        processedSections[sectionName] = [];
      }
    }

    return processedSections;
  }

  /**
   * 모든 prompt들을 조합 (동적 섹션 지원)
   */
  static combinePrompts(
    taskYaml: TaskYaml,
    processedSections: Record<string, ComponentYaml[]>,
    useEnhancedPrompt: boolean = false
  ): string {
    const sections: string[] = [];

    // Task 기본 정보
    sections.push(`# Task: ${taskYaml.name}`);
    sections.push(`**Description:** ${taskYaml.description}`);
    sections.push(`**ID:** ${taskYaml.id}`);
    sections.push(`**Status:** ${taskYaml.status}`);

    if (taskYaml.prompt) {
      sections.push(`\n## Task Prompt\n${taskYaml.prompt}`);
    }

    // 동적으로 모든 섹션 처리
    for (const [sectionName, components] of Object.entries(processedSections)) {
      if (components.length === 0) continue;

      // 섹션 제목 생성
      const sectionTitle = this.getSectionTitle(sectionName);
      sections.push(`\n## ${sectionTitle}`);

      // 단일 컴포넌트인 경우 (예: workflow)
      if (components.length === 1) {
        const component = components[0];
        sections.push(`**Name:** ${component.name}`);
        sections.push(`**Description:** ${component.description}`);
        const promptToUse =
          useEnhancedPrompt && component['prompt-enhanced']
            ? component['prompt-enhanced']
            : component.prompt;
        sections.push(`\n${promptToUse}`);
      } else {
        // 다중 컴포넌트인 경우 (예: rules, mcps, notify, issue 등)
        components.forEach((component, index) => {
          sections.push(`\n### ${index + 1}. ${component.name}`);
          sections.push(`**Description:** ${component.description}`);
          const promptToUse =
            useEnhancedPrompt && component['prompt-enhanced']
              ? component['prompt-enhanced']
              : component.prompt;
          sections.push(`\n${promptToUse}`);
        });
      }
    }

    return sections.join('\n');
  }

  /**
   * 섹션 이름을 사용자 친화적인 제목으로 변환
   */
  static getSectionTitle(sectionName: string): string {
    const titleMap: Record<string, string> = {
      workflow: 'Workflow',
      rules: 'Rules',
      mcps: 'MCPs (Model Context Protocols)',
      notify: 'Notifications',
      issue: 'Issue Management',
    };

    return (
      titleMap[sectionName] ||
      sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
    );
  }

  /**
   * Start Task 핵심 로직
   */
  static async execute(
    input: StartTaskToolInput
  ): Promise<StartTaskToolResponse> {
    const { taskId, projectRoot, configPath, enhancedPrompt = false } = input;

    try {
      // 1. Task 파일 읽기
      const taskYaml = this.readTaskFile(projectRoot, configPath, taskId);

      // 2. Task 상태 확인 - done 상태면 이미 완료되었다는 메시지 반환
      if (taskYaml.status === 'done') {
        return {
          success: true,
          message: `✅ Task '${taskId}'는 이미 완료되었습니다. (상태: ${taskYaml.status})`,
          taskId,
          combinedPrompt: `# Task: ${taskYaml.name}\n**Description:** ${taskYaml.description}\n**ID:** ${taskYaml.id}\n**Status:** ${taskYaml.status}\n\n이 태스크는 이미 완료되었습니다.`,
          files: taskYaml.jobs,
        };
      }

      // 3. 모든 Jobs 섹션 동적 처리
      const processedSections = this.processJobsSection(
        projectRoot,
        configPath,
        taskYaml.jobs
      );

      // 4. 모든 prompt들 조합
      const combinedPrompt = this.combinePrompts(
        taskYaml,
        processedSections,
        enhancedPrompt
      );

      return {
        success: true,
        message: `✅ Task '${taskId}' 시작 준비가 완료되었습니다.`,
        taskId,
        combinedPrompt,
        files: taskYaml.jobs,
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Task 시작 실패: ${error instanceof Error ? error.message : String(error)}`,
        taskId,
      };
    }
  }
}

/**
 * Start Task 도구 실행 함수
 */
export async function executeStartTaskTool(
  args: unknown
): Promise<StartTaskToolResponse> {
  const input = StartTaskToolSchema.parse(args);
  return StartTaskTool.execute(input);
}
