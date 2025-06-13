import { join } from 'node:path';
import { readYamlFile } from './yaml.js';
import { InvalidContextError } from '../errors.js';

/**
 * Generic YAML structure for assets (personas, rules, actions, etc.)
 */
interface AssetYaml {
  version: number;
  kind: string;
  name: string;
  description: string;
  prompt?: string;
  'enhanced-prompt'?: string;
}

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

interface ProcessedSections {
  [key: string]: string[];
}

/**
 * Processes all sections in the context file (e.g., personas, rules),
 * reads the referenced YAML files, and extracts their prompts.
 */
export async function processContextSections(
  projectRoot: string,
  contextSections: { [key: string]: string[] | undefined },
  useEnhancedPrompt: boolean
): Promise<ProcessedSections> {
  const processedSections: ProcessedSections = {};
  const promptStyle = useEnhancedPrompt ? 'enhanced-prompt' : 'prompt';

  for (const section in contextSections) {
    if (
      Object.prototype.hasOwnProperty.call(contextSections, section) &&
      contextSections[section]
    ) {
      processedSections[section] = [];
      const files = contextSections[section] as string[];

      for (const file of files) {
        const filePath = join(projectRoot, '.contextcompose', file);
        const asset = await readYamlFile<AssetYaml>(filePath);

        // According to a memory, the kind in the YAML file should match the directory name (section).
        const expectedKind = section.endsWith('s')
          ? section.slice(0, -1)
          : section;
        if (asset.kind !== expectedKind) {
          throw new InvalidContextError(
            `Invalid kind for ${file}. Expected '${expectedKind}', but got '${asset.kind}'.`
          );
        }

        const prompt = asset[promptStyle] ?? asset.prompt;
        if (prompt) {
          processedSections[section].push(prompt);
        }
      }
    }
  }

  return processedSections;
}

/**
 * Combines prompts from the main context file and all its components
 * into a single string for the AI model.
 */
export function combinePrompts(
  contextYaml: ContextYaml,
  processedSections: ProcessedSections,
  useEnhancedPrompt = true
): string {
  const prompts: string[] = [];

  // 1. Add the main context prompt
  const mainPrompt = useEnhancedPrompt
    ? contextYaml['enhanced-prompt']
    : contextYaml.prompt;

  if (mainPrompt) {
    prompts.push(`### Context: ${contextYaml.name}\\n${mainPrompt}`);
  } else {
    throw new Error(
      `No suitable prompt found for context '${contextYaml.name}'. Checked for 'enhanced-prompt' and 'prompt'.`
    );
  }

  // 2. Add prompts from all other sections
  for (const section of Object.keys(processedSections).sort()) {
    const sectionPrompts = processedSections[section];
    if (sectionPrompts.length > 0) {
      prompts.push(`### ${section}\\n${sectionPrompts.join('\\n\\n')}`);
    }
  }

  // 3. Join all prompts and add a final instruction
  return `${prompts.join('\\n\\n')}\\n\\nWhat task should we start?`;
}
