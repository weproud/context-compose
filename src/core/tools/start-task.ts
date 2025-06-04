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
   * 모든 prompt들을 조합
   */
  static combinePrompts(
    taskYaml: TaskYaml,
    workflowYaml?: ComponentYaml,
    rulesYamls: ComponentYaml[] = [],
    mcpsYamls: ComponentYaml[] = [],
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

    // Workflow
    if (workflowYaml) {
      sections.push(`\n## Workflow: ${workflowYaml.name}`);
      sections.push(`**Description:** ${workflowYaml.description}`);
      const promptToUse =
        useEnhancedPrompt && workflowYaml['prompt-enhanced']
          ? workflowYaml['prompt-enhanced']
          : workflowYaml.prompt;
      sections.push(`\n${promptToUse}`);
    }

    // Rules
    if (rulesYamls.length > 0) {
      sections.push('\n## Rules');
      rulesYamls.forEach((rule, index) => {
        sections.push(`\n### ${index + 1}. ${rule.name}`);
        sections.push(`**Description:** ${rule.description}`);
        const promptToUse =
          useEnhancedPrompt && rule['prompt-enhanced']
            ? rule['prompt-enhanced']
            : rule.prompt;
        sections.push(`\n${promptToUse}`);
      });
    }

    // MCPs
    if (mcpsYamls.length > 0) {
      sections.push('\n## MCPs (Model Context Protocols)');
      mcpsYamls.forEach((mcp, index) => {
        sections.push(`\n### ${index + 1}. ${mcp.name}`);
        sections.push(`**Description:** ${mcp.description}`);
        const promptToUse =
          useEnhancedPrompt && mcp['prompt-enhanced']
            ? mcp['prompt-enhanced']
            : mcp.prompt;
        sections.push(`\n${promptToUse}`);
      });
    }

    return sections.join('\n');
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
          files: {
            workflow: taskYaml.jobs.workflow,
            rules: taskYaml.jobs.rules || [],
            mcps: taskYaml.jobs.mcps || [],
          },
        };
      }

      const files = {
        workflow: taskYaml.jobs.workflow,
        rules: taskYaml.jobs.rules || [],
        mcps: taskYaml.jobs.mcps || [],
      };

      // 3. Workflow 파일 읽기 (선택적)
      let workflowYaml: ComponentYaml | undefined;
      if (taskYaml.jobs.workflow) {
        try {
          workflowYaml = this.readWorkflowFile(
            projectRoot,
            configPath,
            taskYaml.jobs.workflow
          );
        } catch (error) {
          console.warn(
            `⚠️  Workflow 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // 4. Rules 파일들 읽기
      let rulesYamls: ComponentYaml[] = [];
      if (taskYaml.jobs.rules && taskYaml.jobs.rules.length > 0) {
        try {
          rulesYamls = this.readRulesFiles(
            projectRoot,
            configPath,
            taskYaml.jobs.rules
          );
        } catch (error) {
          console.warn(
            `⚠️  Rules 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // 5. MCPs 파일들 읽기
      let mcpsYamls: ComponentYaml[] = [];
      if (taskYaml.jobs.mcps && taskYaml.jobs.mcps.length > 0) {
        try {
          mcpsYamls = this.readMcpsFiles(
            projectRoot,
            configPath,
            taskYaml.jobs.mcps
          );
        } catch (error) {
          console.warn(
            `⚠️  MCPs 파일 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // 6. 모든 prompt들 조합
      const combinedPrompt = this.combinePrompts(
        taskYaml,
        workflowYaml,
        rulesYamls,
        mcpsYamls,
        enhancedPrompt
      );

      return {
        success: true,
        message: `✅ Task '${taskId}' 시작 준비가 완료되었습니다.`,
        taskId,
        combinedPrompt,
        files,
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
