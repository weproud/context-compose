import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type {
  StartContextToolInput,
  StartContextToolResponse,
} from '../../schemas/start-context.js';
import { StartContextToolSchema } from '../../schemas/start-context.js';
import {
  FileNotFoundError,
  InvalidContextError,
  YamlParseError,
} from '../errors.js';
import { fileExists } from '../utils/index.js';
import * as z from 'zod';

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
 * Read and parse a YAML file asynchronously.
 */
async function readYamlFile<T>(filePath: string): Promise<T> {
  if (!(await fileExists(filePath))) {
    throw new FileNotFoundError(filePath);
  }
  try {
    const content = await readFile(filePath, 'utf8');
    return parseYaml(content) as T;
  } catch (error) {
    throw new YamlParseError(
      filePath,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Reads the main context file (e.g., feature-context.yaml) asynchronously.
 */
async function readContextFile(
  projectRoot: string,
  contextName: string
): Promise<ContextYaml> {
  const contextFilePath = join(
    projectRoot,
    '.contextcompose',
    `${contextName}-context.yaml`
  );
  const context = await readYamlFile<ContextYaml>(contextFilePath);
  if (context.kind !== 'context') {
    throw new InvalidContextError(
      `Invalid context file kind: ${context.kind}. Expected 'context'.`
    );
  }
  return context;
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

  const finalPrompt = `${promptToUse}\\n\\nWhat task should we start?`;

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
    const contextYaml = await readContextFile(
      input.projectRoot,
      input.contextName
    );

    // 2. The new logic is to just use the enhanced prompt from the context file.
    // The `processContextSections` is not strictly needed to generate the prompt if we follow the pattern
    // in the provided `assets/*-context.yaml` files, but we can keep it for potential future use,
    // and to validate that all referenced files exist.
    // const _processedSections = processContextSections(
    //   input.projectRoot,
    //   contextYaml.context,
    //   true, // `validateFiles` is set to true
    // );

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
 * Validates the input arguments for the Start Context tool and executes the core logic.
 * This function serves as the main entry point for the MCP tool, ensuring
 * that the provided arguments are valid before proceeding.
 * It reads the specified context file and constructs the initial prompt.
 */
export async function executeStartContextTool(
  args: unknown
): Promise<StartContextToolResponse> {
  try {
    const validatedArgs = StartContextToolSchema.parse(args);
    return await executeStartContext(validatedArgs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => e.message).join(', ');
      return {
        success: false,
        message: `Invalid input: ${errorMessages}`,
        contextName: (args as StartContextToolInput)?.contextName || '',
      };
    }
    // Handle other errors (e.g., from executeStartContext)
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to start context: ${errorMessage}`,
      contextName: (args as { contextName?: string })?.contextName || '',
    };
  }
}
