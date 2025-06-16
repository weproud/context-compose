import { join } from 'node:path';
import * as z from 'zod';
import type {
  StartContextToolInput,
  StartContextToolResponse,
} from '../../schemas/start-context.js';
import { StartContextToolSchema } from '../../schemas/start-context.js';
import { InvalidContextError } from '../errors.js';
import {
  combinePrompts,
  processContextSections,
} from '../utils/prompt-combiner.js';
import { SecuritySchemas, defaultPathValidator } from '../utils/security.js';
import { readYamlFile } from '../utils/yaml.js';

/**
 * Main context YAML file structure type
 */
interface ContextYaml {
  version: number;
  kind: 'context';
  name: string;
  description: string;
  context: {
    [key: string]: string[] | undefined;
  };
  prompt?: string;
  'enhanced-prompt'?: string;
}

/**
 * Reads the main context file (e.g., feature-context.yaml) asynchronously.
 */
async function readContextFile(
  projectRoot: string,
  contextName: string
): Promise<ContextYaml> {
  // Validate inputs for security
  SecuritySchemas.projectRoot.parse(projectRoot);
  SecuritySchemas.contextName.parse(contextName);

  const contextFilePath = join(
    projectRoot,
    '.contextcompose',
    `${contextName}-context.yaml`
  );

  // Validate path is within project root
  const validatedPath = defaultPathValidator.validateContextPath(
    contextFilePath,
    projectRoot
  );

  const context = await readYamlFile<ContextYaml>(validatedPath);
  if (context.kind !== 'context') {
    throw new InvalidContextError(
      `Invalid context file kind: ${context.kind}. Expected 'context'.`,
      { contextName, kind: context.kind }
    );
  }
  return context;
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

    // 2. Process all referenced files (personas, rules, etc.)
    const processedSections = await processContextSections(
      input.projectRoot,
      contextYaml.context,
      input.enhancedPrompt
    );

    // 3. Combine prompts into a single string
    const combinedPrompt = combinePrompts(
      contextYaml,
      processedSections,
      input.enhancedPrompt
    );

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
      const errorMessages = error.errors.map((e) => e.message).join(', ');
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
