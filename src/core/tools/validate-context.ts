import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type {
  ValidateContextToolInput,
  ValidateContextToolResponse,
  ValidationError,
} from '../../schemas/validate-context.js';
import { ValidateContextToolSchema } from '../../schemas/validate-context.js';
import { fileExists } from '../utils/index.js';

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

async function validateComponentFile(
  filePath: string
): Promise<ValidationError | null> {
  if (!(await fileExists(filePath))) {
    return { filePath, message: 'File does not exist.' };
  }

  try {
    const content = await readFile(filePath, 'utf8');
    const yaml = parseYaml(content);
    const result = RequiredFieldsSchema.safeParse(yaml);

    if (!result.success) {
      const missing = result.error.issues
        .map((i) => i.path.join('.'))
        .join(', ');
      return {
        filePath,
        message: `Missing or invalid required fields: ${missing}`,
      };
    }
  } catch (error) {
    return {
      filePath,
      message: `Failed to parse YAML file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
  return null;
}

export async function executeValidateContext(
  input: ValidateContextToolInput
): Promise<ValidateContextToolResponse> {
  const { projectRoot, contextName } = input;
  const allErrors: ValidationError[] = [];
  let validatedFilesCount = 0;

  try {
    const contextFilePath = join(
      projectRoot,
      '.contextcompose',
      `${contextName}-context.yaml`
    );

    const mainContextError = await validateComponentFile(contextFilePath);
    validatedFilesCount++;
    if (mainContextError) {
      allErrors.push(mainContextError);
      // Stop early if the main context file is invalid
      return {
        success: false,
        message: `Validation failed for context '${contextName}'. The main context file has errors.`,
        contextName,
        validatedFiles: validatedFilesCount,
        errors: allErrors,
      };
    }

    const contextContent = await readFile(contextFilePath, 'utf8');
    const contextYaml = parseYaml(contextContent) as ContextYaml;

    if (contextYaml.context) {
      const validationPromises: Promise<ValidationError | null>[] = [];
      for (const files of Object.values(contextYaml.context)) {
        if (!Array.isArray(files)) continue;
        for (const relativePath of files) {
          const componentPath = join(
            projectRoot,
            '.contextcompose',
            relativePath
          );
          validationPromises.push(validateComponentFile(componentPath));
        }
      }

      const results = await Promise.all(validationPromises);
      validatedFilesCount += results.length;
      allErrors.push(
        ...results.filter((e): e is ValidationError => e !== null)
      );
    }

    if (allErrors.length > 0) {
      return {
        success: false,
        message: `Validation failed for context '${contextName}' with ${allErrors.length} error(s).`,
        contextName,
        validatedFiles: validatedFilesCount,
        errors: allErrors,
      };
    }

    return {
      success: true,
      message: `✅ Context '${contextName}' is valid. All ${validatedFilesCount} files checked successfully.`,
      contextName,
      validatedFiles: validatedFilesCount,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`,
      contextName,
      validatedFiles: validatedFilesCount,
      errors: allErrors,
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
      contextName: (args as ValidateContextToolInput)?.contextName || '',
      validatedFiles: 0,
      errors: [],
    };
  }
  return executeValidateContext(validationResult.data);
}
