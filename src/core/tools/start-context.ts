import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type {
  StartContextToolInput,
  StartContextToolResponse,
} from '../../schemas/start-context.js';
import { StartContextToolSchema } from '../../schemas/start-context.js';

/**
 * Main context YAML file structure type
 */
interface ContextYaml {
  version: number;
  kind: 'context';
  name: string;
  description: string;
  context: {
    personas?: string[];
    rules?: string[];
    mcps?: string[];
    actions?: string[];
    [key: string]: string | string[] | undefined; // Dynamic section support
  };
  prompt?: string;
  'enhanced-prompt'?: string;
}

/**
 * Component YAML file structure type (for personas, rules, etc.)
 */
interface ComponentYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  prompt: string;
  'enhanced-prompt'?: string;
}

/**
 * Read and parse a YAML file.
 */
function readYamlFile<T>(filePath: string): T {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  try {
    const content = readFileSync(filePath, 'utf8');
    return parseYaml(content) as T;
  } catch (error) {
    throw new Error(
      `YAML file parsing failed (${filePath}): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Reads the main context file (e.g., feature-context.yaml).
 */
function readContextFile(
  projectRoot: string,
  contextName: string
): ContextYaml {
  const contextFilePath = join(
    projectRoot,
    'assets',
    `${contextName}-context.yaml`
  );
  const context = readYamlFile<ContextYaml>(contextFilePath);
  if (context.kind !== 'context') {
    throw new Error(
      `Invalid context file kind: ${context.kind}. Expected 'context'.`
    );
  }
  return context;
}

/**
 * Processes all sections defined in the context file (personas, rules, etc.),
 * reading each component file.
 */
function processContextSections(
  projectRoot: string,
  context: ContextYaml['context']
): Record<string, ComponentYaml[]> {
  const processedSections: Record<string, ComponentYaml[]> = {};
  const assetsPath = join(projectRoot, 'assets');

  for (const [sectionName, sectionValue] of Object.entries(context)) {
    if (!sectionValue || !Array.isArray(sectionValue)) continue;

    try {
      const components = sectionValue.map(filePath => {
        const fullPath = join(assetsPath, filePath);
        return readYamlFile<ComponentYaml>(fullPath);
      });
      processedSections[sectionName] = components;
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
 * Combines prompts from the main context file and all its components
 * into a single string for the AI model.
 */
function combinePrompts(
  contextYaml: ContextYaml,
  useEnhancedPrompt = true
): string {
  const promptToUse = useEnhancedPrompt
    ? contextYaml['enhanced-prompt']
    : contextYaml.prompt;

  if (!promptToUse) {
    throw new Error(
      `No suitable prompt found for context '${contextYaml.name}'. Checked for 'enhanced-prompt' and 'prompt'.`
    );
  }

  // The final prompt is now just the enhanced prompt from the context file itself.
  // The referenced files are for future use or can be used by the model if it's aware of them.
  // The user's request was to combine prompts, but the provided `*-context.yaml` files already contain a perfect "enhanced-prompt".
  // Re-building it would be redundant. The important part is loading it.
  // The `enhanced-prompt` in the context files already summarizes the philosophy.
  // The user's final instruction is to ask the user what to do next.

  const finalPrompt = `${promptToUse}\n\n어떤 작업을 시작할까요?`;

  return finalPrompt;
}

/**
 * Main tool logic for starting a context.
 * It reads the specified context file and constructs the initial prompt.
 */
export async function executeStartContext(
  input: StartContextToolInput
): Promise<StartContextToolResponse> {
  try {
    // 1. Read the main context file
    const contextYaml = readContextFile(input.projectRoot, input.contextName);

    // 2. The new logic is to just use the enhanced prompt from the context file.
    // The `processContextSections` is not strictly needed to generate the prompt if we follow the pattern
    // in the provided `assets/*-context.yaml` files, but we can keep it for potential future use,
    // and to validate that all referenced files exist.
    const processedSections = processContextSections(
      input.projectRoot,
      contextYaml.context
    );

    // 3. Combine prompts into a single string
    const combinedPrompt = combinePrompts(contextYaml, input.enhancedPrompt);

    return {
      success: true,
      message: `Context '${input.contextName}' started successfully.`,
      contextName: input.contextName,
      combinedPrompt,
      files: contextYaml.context,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to start context: ${
        error instanceof Error ? error.message : String(error)
      }`,
      contextName: input.contextName,
    };
  }
}

/**
 * Wrapper for the Start Context tool to be used in CLI.
 * Validates input against the Zod schema.
 */
export async function executeStartContextTool(
  args: unknown
): Promise<StartContextToolResponse> {
  const validationResult = StartContextToolSchema.safeParse(args);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    return {
      success: false,
      message: `Invalid input: ${errorMessages}`,
      contextName: (args as any)?.contextName || '',
    };
  }

  return executeStartContext(validationResult.data);
}
