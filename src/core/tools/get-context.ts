import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type {
  GetContextToolInput,
  GetContextToolResponse,
} from '../../schemas/get-context.js';
import { GetContextToolSchema } from '../../schemas/get-context.js';

/**
 * Task YAML file structure type
 */
interface ContextYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  context: {
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

/**
 * Context ID formatting (preserve hyphens and handle context- prefix)
 */
function formatContextId(contextId: string): string {
  // If contextId already starts with 'context-', remove it to avoid duplication
  if (contextId.startsWith('context-')) {
    return contextId.substring(8); // Remove 'context-' prefix
  }
  return contextId;
}

/**
 * Read and parse YAML file
 */
function readYamlFile<T = ComponentYaml>(filePath: string): T {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const parsed = parseYaml(content) as T;
    return parsed;
  } catch (error) {
    throw new Error(
      `YAML file parsing failed (${filePath}): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Read context file
 */
function readContextFile(projectRoot: string, contextId: string): ContextYaml {
  const formattedId = formatContextId(contextId);

  // All contexts use .contextcompose directory
  const contextFilePath = join(
    projectRoot,
    '.contextcompose',
    `${formattedId}-context.yaml`
  );

  return readYamlFile<ContextYaml>(contextFilePath);
}

/**
 * Read workflow file
 */
function readWorkflowFile(
  projectRoot: string,
  workflowPath: string
): ComponentYaml {
  const fullPath = join(projectRoot, '.contextcompose', workflowPath);
  return readYamlFile(fullPath);
}

/**
 * Read rules files
 */
function readRulesFiles(
  projectRoot: string,
  rulesPaths: string[]
): ComponentYaml[] {
  return rulesPaths.map((rulePath) => {
    const fullPath = join(projectRoot, '.contextcompose', rulePath);
    return readYamlFile(fullPath);
  });
}

/**
 * Read MCPs files
 */
function readMcpsFiles(
  projectRoot: string,
  mcpsPaths: string[]
): ComponentYaml[] {
  return mcpsPaths.map((mcpPath) => {
    const fullPath = join(projectRoot, '.contextcompose', mcpPath);
    return readYamlFile(fullPath);
  });
}

/**
 * Read component files (generic)
 */
function readComponentFiles(
  projectRoot: string,
  filePaths: string[]
): ComponentYaml[] {
  return filePaths.map((filePath) => {
    const fullPath = join(projectRoot, '.contextcompose', filePath);
    return readYamlFile(fullPath);
  });
}

/**
 * Read single component file (generic)
 */
function readComponentFile(
  projectRoot: string,
  filePath: string
): ComponentYaml {
  const fullPath = join(projectRoot, '.contextcompose', filePath);
  return readYamlFile(fullPath);
}

/**
 * Process Jobs section - dynamically handle all sections
 */
function processJobsSection(
  projectRoot: string,
  context: ContextYaml['context']
): Record<string, ComponentYaml[]> {
  const processedSections: Record<string, ComponentYaml[]> = {};

  // All contexts use .contextcompose directory
  const configPath = '.contextcompose';

  for (const [sectionName, sectionValue] of Object.entries(context)) {
    if (!sectionValue) continue;

    try {
      if (typeof sectionValue === 'string') {
        // Single file (e.g., workflow)
        const fullPath = join(projectRoot, configPath, sectionValue);
        const component = readYamlFile<ComponentYaml>(fullPath);
        processedSections[sectionName] = [component];
      } else if (Array.isArray(sectionValue)) {
        // File array (e.g., rules, mcps, notify, issue, etc.)
        const components = sectionValue.map((filePath) => {
          const fullPath = join(projectRoot, configPath, filePath);
          return readYamlFile<ComponentYaml>(fullPath);
        });
        processedSections[sectionName] = components;
      }
    } catch (error) {
      console.warn(
        `⚠️  Failed to read ${sectionName} files: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      processedSections[sectionName] = [];
    }
  }

  return processedSections;
}

/**
 * Combine all prompts (with dynamic section support)
 */
function combinePrompts(
  contextYaml: ContextYaml,
  processedSections: Record<string, ComponentYaml[]>,
  useEnhancedPrompt = false
): string {
  const sections: string[] = [];

  // Task basic information
  sections.push(`# Task: ${contextYaml.name}`);
  sections.push(`**Description:** ${contextYaml.description}`);

  // Define the desired order for sections
  const sectionOrder = ['workflow', 'rules', 'mcps', 'notify', 'context'];

  // Process sections in the specified order FIRST
  for (const sectionName of sectionOrder) {
    const components = processedSections[sectionName];
    if (!components || components.length === 0) continue;

    // Generate section title
    const sectionTitle = getSectionTitle(sectionName);
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

  // Process any remaining sections that are not in the predefined order
  for (const [sectionName, components] of Object.entries(processedSections)) {
    if (sectionOrder.includes(sectionName) || components.length === 0) continue;

    // Generate section title
    const sectionTitle = getSectionTitle(sectionName);
    sections.push(`\n## ${sectionTitle}`);

    // Single component case
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
      // Multiple components case
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

  // Add context prompt LAST (after all component prompts)
  if (contextYaml.prompt) {
    sections.push(`\n## Task Prompt\n${contextYaml.prompt}`);
  }

  return sections.join('\n');
}

/**
 * Convert section name to user-friendly title
 */
function getSectionTitle(sectionName: string): string {
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
export async function executeGetContext(
  input: GetContextToolInput
): Promise<GetContextToolResponse> {
  const { contextId, projectRoot, enhancedPrompt = false } = input;

  try {
    // 1. Read context file
    const contextYaml = readContextFile(projectRoot, contextId);

    // 2. Validate context structure
    if (!contextYaml || !contextYaml.context) {
      throw new Error(
        'Invalid context structure: context property is missing or null'
      );
    }

    // 3. Process all Jobs sections dynamically
    const processedSections = processJobsSection(
      projectRoot,
      contextYaml.context
    );

    // 4. Combine all prompts
    const combinedPrompt = combinePrompts(
      contextYaml,
      processedSections,
      enhancedPrompt
    );

    return {
      success: true,
      message: `✅ Context '${contextId}' is ready.`,
      contextId,
      combinedPrompt,
      files: contextYaml.context,
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to get context: ${
        error instanceof Error ? error.message : String(error)
      }`,
      contextId,
    };
  }
}

/**
 * Get Context tool execution function
 */
export async function executeGetContextTool(
  args: unknown
): Promise<GetContextToolResponse> {
  const input = GetContextToolSchema.parse(args);
  return executeGetContext(input);
}

// 기존 클래스와의 호환성을 위한 객체 export
export const GetContextTool = {
  formatContextId,
  readYamlFile,
  readContextFile,
  readWorkflowFile,
  readRulesFiles,
  readMcpsFiles,
  readComponentFiles,
  readComponentFile,
  processJobsSection,
  combinePrompts,
  getSectionTitle,
  execute: executeGetContext,
};
