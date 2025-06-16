import { readFile } from 'node:fs/promises';
import * as fs from 'node:fs/promises';
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
  filePath: string,
  projectRoot: string
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  if (!(await fileExists(filePath))) {
    return [{ filePath, message: 'File does not exist.' }];
  }

  try {
    const content = await readFile(filePath, 'utf8');
    const yaml = parseYaml(content);
    const result = RequiredFieldsSchema.safeParse(yaml);

    if (!result.success) {
      const missing = result.error.issues.map(i => i.path.join('.')).join(', ');
      errors.push({
        filePath,
        message: `Missing or invalid required fields: ${missing}`,
      });
    }

    // Check if this is a context file and validate references
    const fileName = filePath.split('/').pop() || '';
    if (
      fileName.endsWith('-context.yaml') ||
      fileName.endsWith('-context.yml')
    ) {
      const referenceErrors = await validateContextReferences(
        filePath,
        yaml,
        projectRoot
      );
      errors.push(...referenceErrors);
    }
  } catch (error) {
    errors.push({
      filePath,
      message: `Failed to parse YAML file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }

  return errors;
}

async function validateContextReferences(
  contextFilePath: string,
  contextYaml: any,
  projectRoot: string
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const contextDir = join(projectRoot, '.contextcompose');

  if (!contextYaml.context || typeof contextYaml.context !== 'object') {
    return errors;
  }

  const sections = ['personas', 'rules', 'mcps', 'actions'];

  for (const section of sections) {
    const sectionData = contextYaml.context[section];
    if (Array.isArray(sectionData)) {
      for (const referencedFile of sectionData) {
        if (typeof referencedFile === 'string') {
          const referencedFilePath = join(contextDir, referencedFile);
          if (!(await fileExists(referencedFilePath))) {
            errors.push({
              filePath: contextFilePath,
              message: `Referenced file does not exist: ${referencedFile}`,
            });
          }
        }
      }
    }
  }

  return errors;
}

async function executeValidateContext(
  args: ValidateContextToolInput
): Promise<ValidateContextToolResponse> {
  const { projectRoot } = args;
  const errors: ValidationError[] = [];
  const validatedFiles: string[] = [];

  try {
    const rootPath = join(projectRoot, '.contextcompose');
    if (!(await fileExists(rootPath))) {
      return {
        success: false,
        message:
          'Validation failed: .contextcompose directory not found in project root.',
        validatedFiles: 0,
        errors: [{ filePath: rootPath, message: 'Directory not found' }],
      };
    }

    const assetTypes = ['actions', 'mcps', 'personas', 'rules', 'contexts'];
    for (const assetType of assetTypes) {
      const assetDir = join(rootPath, assetType);
      if (await fileExists(assetDir)) {
        const files = await fs.readdir(assetDir);
        for (const file of files) {
          if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            const filePath = join(assetDir, file);
            validatedFiles.push(filePath);
            const fileErrors = await validateComponentFile(
              filePath,
              projectRoot
            );
            errors.push(...fileErrors);
          }
        }
      }
    }

    // Also validate context files in the root of .contextcompose
    const contextFiles = await fs.readdir(rootPath);
    for (const file of contextFiles) {
      if (
        (file.endsWith('-context.yaml') || file.endsWith('-context.yml')) &&
        (file.endsWith('.yaml') || file.endsWith('.yml'))
      ) {
        const filePath = join(rootPath, file);
        validatedFiles.push(filePath);
        const fileErrors = await validateComponentFile(filePath, projectRoot);
        errors.push(...fileErrors);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Validation failed with ${errors.length} errors.`,
        validatedFiles: validatedFiles.length,
        errors,
      };
    }

    return {
      success: true,
      message: `Successfully validated ${validatedFiles.length} files.`,
      validatedFiles: validatedFiles.length,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred.',
      validatedFiles: 0,
      errors: [
        {
          filePath: '',
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.',
        },
      ],
    };
  }
}

export async function executeValidateContextTool(
  args: unknown
): Promise<ValidateContextToolResponse> {
  const validationResult = ValidateContextToolSchema.safeParse(args);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    return {
      success: false,
      message: `Invalid input: ${errorMessages}`,
      validatedFiles: 0,
      errors: [],
    };
  }

  return executeValidateContext(validationResult.data);
}
