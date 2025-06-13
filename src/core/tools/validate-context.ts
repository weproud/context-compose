import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type {
  ValidateContextToolInput,
  ValidateContextToolResponse,
  ValidationError,
} from '../../schemas/validate-context.js';
import { ValidateContextToolSchema } from '../../schemas/validate-context.js';

interface ContextYaml {
  context?: {
    [key: string]: string[] | undefined;
  };
}

const RequiredFieldsSchema = z
  .object({
    version: z.union([z.string(), z.number()]),
    kind: z.string(),
    name: z.string(),
    description: z.string(),
    prompt: z.string(),
    'enhanced-prompt': z.string(),
  })
  .passthrough();

function validateComponentFile(
  filePath: string,
  errors: ValidationError[]
): void {
  if (!existsSync(filePath)) {
    errors.push({ filePath, message: 'File does not exist.' });
    return;
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const yaml = parseYaml(content);
    const result = RequiredFieldsSchema.safeParse(yaml);

    if (!result.success) {
      const missing = result.error.issues
        .map((i) => i.path.join('.'))
        .join(', ');
      errors.push({
        filePath,
        message: `Missing or invalid required fields: ${missing}`,
      });
    }
  } catch (error) {
    errors.push({
      filePath,
      message: `Failed to parse YAML file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}

export async function executeValidateContext(
  input: ValidateContextToolInput
): Promise<ValidateContextToolResponse> {
  const { projectRoot, contextName } = input;
  const errors: ValidationError[] = [];
  let validatedFiles = 0;

  try {
    const contextFilePath = join(
      projectRoot,
      'assets',
      `${contextName}-context.yaml`
    );
    validateComponentFile(contextFilePath, errors);
    validatedFiles++;

    // If the main context file has errors, we can stop early, but it's more comprehensive to check all files.
    const contextContent = readFileSync(contextFilePath, 'utf8');
    const contextYaml = parseYaml(contextContent) as ContextYaml;

    if (contextYaml.context) {
      for (const files of Object.values(contextYaml.context)) {
        if (!Array.isArray(files)) continue;
        for (const relativePath of files) {
          const componentPath = join(projectRoot, 'assets', relativePath);
          validateComponentFile(componentPath, errors);
          validatedFiles++;
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Validation failed for context '${contextName}' with ${errors.length} error(s).`,
        contextName,
        validatedFiles,
        errors,
      };
    }

    return {
      success: true,
      message: `✅ Context '${contextName}' is valid. All ${validatedFiles} files checked successfully.`,
      contextName,
      validatedFiles,
      errors: [],
    };
  } catch (error) {
    // This catches errors from reading the main context file if it's unparsable or missing after the initial check
    return {
      success: false,
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`,
      contextName,
      validatedFiles,
      errors,
    };
  }
}

export async function executeValidateContextTool(
  args: unknown
): Promise<ValidateContextToolResponse> {
  const validationResult = ValidateContextToolSchema.safeParse(args);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    return {
      success: false,
      message: `Invalid input: ${errorMessages}`,
      contextName: (args as any)?.contextName || '',
      validatedFiles: 0,
      errors: [],
    };
  }
  return executeValidateContext(validationResult.data);
}
