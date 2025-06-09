import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type {
  GetContextToolInput,
  GetContextToolResponse,
} from '../../schemas/get-context.js';
import { GetContextToolSchema } from '../../schemas/get-context.js';

/**
 * Task YAML file structure type
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
    [key: string]: string | string[] | undefined; // Dynamic section support
  };
  prompt?: string;
}

/**
 * Workflow/Rule/MCP YAML file structure type
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
 * Get Context tool core logic
 */
export class GetContextTool {
  /**
   * Context ID formatting (preserve hyphens)
   */
  static formatContextId(contextId: string): string {
    return contextId;
  }

  /**
   * Read and parse YAML file
   */
  static readYamlFile<T = ComponentYaml>(filePath: string): T {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const parsed = parseYaml(content) as T;
      return parsed;
    } catch (error) {
      throw new Error(
        `YAML file parsing failed (${filePath}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Read context file
   */
  static readContextFile(
    projectRoot: string,
    configPath: string,
    contextId: string
  ): TaskYaml {
    const formattedId = this.formatContextId(contextId);

    // Special handling for 'default' context - read from assets/context-default.yaml
    if (formattedId === 'default') {
      const contextFilePath = join(
        projectRoot,
        'assets',
        'context-default.yaml'
      );
      return this.readYamlFile<TaskYaml>(contextFilePath);
    }

    // For other contexts, use the standard path
    const contextFilePath = join(
      projectRoot,
      configPath,
      `task-${formattedId}.yaml`
    );

    return this.readYamlFile<TaskYaml>(contextFilePath);
  }

  /**
   * Read workflow file
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
   * Read rules files
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
   * Read MCPs files
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
   * Read component files (generic)
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
   * Read single component file (generic)
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
   * Process Jobs section - dynamically handle all sections
   */
  static processJobsSection(
    projectRoot: string,
    configPath: string,
    jobs: TaskYaml['jobs'],
    contextId?: string
  ): Record<string, ComponentYaml[]> {
    const processedSections: Record<string, ComponentYaml[]> = {};

    // For 'default' context, use 'assets' directory instead of configPath
    const actualConfigPath = contextId === 'default' ? 'assets' : configPath;

    for (const [sectionName, sectionValue] of Object.entries(jobs)) {
      if (!sectionValue) continue;

      try {
        if (typeof sectionValue === 'string') {
          // Single file (e.g., workflow)
          const component = this.readComponentFile(
            projectRoot,
            actualConfigPath,
            sectionValue
          );
          processedSections[sectionName] = [component];
        } else if (Array.isArray(sectionValue)) {
          // File array (e.g., rules, mcps, notify, issue, etc.)
          const components = this.readComponentFiles(
            projectRoot,
            actualConfigPath,
            sectionValue
          );
          processedSections[sectionName] = components;
        }
      } catch (error) {
        console.warn(
          `⚠️  Failed to read ${sectionName} files: ${error instanceof Error ? error.message : String(error)}`
        );
        processedSections[sectionName] = [];
      }
    }

    return processedSections;
  }

  /**
   * Combine all prompts (with dynamic section support)
   */
  static combinePrompts(
    taskYaml: TaskYaml,
    processedSections: Record<string, ComponentYaml[]>,
    useEnhancedPrompt: boolean = false
  ): string {
    const sections: string[] = [];

    // Task basic information
    sections.push(`# Task: ${taskYaml.name}`);
    sections.push(`**Description:** ${taskYaml.description}`);
    sections.push(`**ID:** ${taskYaml.id}`);
    sections.push(`**Status:** ${taskYaml.status}`);

    if (taskYaml.prompt) {
      sections.push(`\n## Task Prompt\n${taskYaml.prompt}`);
    }

    // Process all sections dynamically
    for (const [sectionName, components] of Object.entries(processedSections)) {
      if (components.length === 0) continue;

      // Generate section title
      const sectionTitle = this.getSectionTitle(sectionName);
      sections.push(`\n## ${sectionTitle}`);

      // Single component case (e.g., workflow)
      if (components.length === 1) {
        const component = components[0];
        if (component) {
          sections.push(`**Name:** ${component.name}`);
          sections.push(`**Description:** ${component.description}`);
          const promptToUse =
            useEnhancedPrompt && component['prompt-enhanced']
              ? component['prompt-enhanced']
              : component.prompt;
          sections.push(`\n${promptToUse}`);
        }
      } else {
        // Multiple components case (e.g., rules, mcps, notify, issue, etc.)
        components.forEach((component, index) => {
          if (component) {
            sections.push(`\n### ${index + 1}. ${component.name}`);
            sections.push(`**Description:** ${component.description}`);
            const promptToUse =
              useEnhancedPrompt && component['prompt-enhanced']
                ? component['prompt-enhanced']
                : component.prompt;
            sections.push(`\n${promptToUse}`);
          }
        });
      }
    }

    return sections.join('\n');
  }

  /**
   * Convert section name to user-friendly title
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
   * Get Context core logic
   */
  static async execute(
    input: GetContextToolInput
  ): Promise<GetContextToolResponse> {
    const {
      contextId,
      projectRoot,
      configPath,
      enhancedPrompt = false,
    } = input;

    try {
      // 1. Read context file
      const taskYaml = this.readContextFile(projectRoot, configPath, contextId);

      // 2. Check task status - return completion message if already done
      if (taskYaml.status === 'done') {
        return {
          success: true,
          message: `✅ Context '${contextId}' is already completed. (Status: ${taskYaml.status})`,
          contextId,
          combinedPrompt: `# Task: ${taskYaml.name}\n**Description:** ${taskYaml.description}\n**ID:** ${taskYaml.id}\n**Status:** ${taskYaml.status}\n\nThis task is already completed.`,
          files: taskYaml.jobs,
        };
      }

      // 3. Process all Jobs sections dynamically
      const processedSections = this.processJobsSection(
        projectRoot,
        configPath,
        taskYaml.jobs,
        contextId
      );

      // 4. Combine all prompts
      const combinedPrompt = this.combinePrompts(
        taskYaml,
        processedSections,
        enhancedPrompt
      );

      return {
        success: true,
        message: `✅ Context '${contextId}' is ready.`,
        contextId,
        combinedPrompt,
        files: taskYaml.jobs,
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to get context: ${error instanceof Error ? error.message : String(error)}`,
        contextId,
      };
    }
  }
}

/**
 * Get Context tool execution function
 */
export async function executeGetContextTool(
  args: unknown
): Promise<GetContextToolResponse> {
  const input = GetContextToolSchema.parse(args);
  return GetContextTool.execute(input);
}
