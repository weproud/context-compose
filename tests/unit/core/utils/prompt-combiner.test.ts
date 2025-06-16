import { InvalidContextError } from '@/core/errors';
import {
  combinePrompts,
  processContextSections,
} from '@/core/utils/prompt-combiner';
import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs.promises;
});

vi.mock('@/core/utils/yaml', () => ({
  readYamlFiles: vi.fn(),
}));

const readYamlFilesMock = vi.mocked(
  (await import('@/core/utils/yaml')).readYamlFiles
);

describe('Prompt Combiner', () => {
  afterEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  describe('processContextSections', () => {
    it('should process sections and extract enhanced prompts', async () => {
      const projectRoot = '/app';
      const contextSections = {
        personas: ['personas/p1.yaml'],
        rules: ['rules/r1.yaml'],
      };
      readYamlFilesMock.mockImplementation(async files => {
        if (files[0].includes('p1')) {
          return [
            {
              kind: 'persona',
              'enhanced-prompt': 'persona prompt',
            },
          ];
        }
        if (files[0].includes('r1')) {
          return [
            {
              kind: 'rule',
              'enhanced-prompt': 'rule prompt',
            },
          ];
        }
        return [];
      });

      const result = await processContextSections(
        projectRoot,
        contextSections,
        true
      );

      expect(result).toEqual({
        personas: ['persona prompt'],
        rules: ['rule prompt'],
      });
      expect(readYamlFilesMock).toHaveBeenCalledWith([
        '/app/.contextcompose/personas/p1.yaml',
      ]);
      expect(readYamlFilesMock).toHaveBeenCalledWith([
        '/app/.contextcompose/rules/r1.yaml',
      ]);
    });

    it('should fall back to regular prompt if enhanced is missing', async () => {
      readYamlFilesMock.mockResolvedValue([
        { kind: 'persona', prompt: 'regular persona prompt' },
      ]);

      const result = await processContextSections(
        '/app',
        { personas: ['personas/p1.yaml'] },
        true
      );

      expect(result.personas).toEqual(['regular persona prompt']);
    });

    it('should throw InvalidContextError for mismatched kind', async () => {
      readYamlFilesMock.mockResolvedValue([{ kind: 'wrong-kind' }]);

      await expect(
        processContextSections('/app', { personas: ['personas/p1.yaml'] }, true)
      ).rejects.toThrow(InvalidContextError);
    });

    it('should handle empty sections', async () => {
      const result = await processContextSections(
        '/app',
        { personas: [] },
        true
      );
      expect(result).toEqual({});
      expect(readYamlFilesMock).not.toHaveBeenCalled();
    });
  });

  describe('combinePrompts', () => {
    const baseContext = {
      version: 1,
      kind: 'context' as const,
      name: 'test-context',
      description: 'test-desc',
      context: {},
      'enhanced-prompt': 'main enhanced prompt',
      prompt: 'main regular prompt',
    };

    it('should combine prompts using enhanced-prompt', () => {
      const processedSections = {
        rules: ['rule1', 'rule2'],
        personas: ['persona1'],
      };

      const result = combinePrompts(baseContext, processedSections, true);

      expect(result).toContain(
        '### Context: test-context\\nmain enhanced prompt'
      );
      expect(result).toContain('### personas\\npersona1');
      expect(result).toContain('### rules\\nrule1\\n\\nrule2');
      expect(result.endsWith('What task should we start?')).toBe(true);
    });

    it('should combine prompts using regular prompt', () => {
      const processedSections = {
        rules: ['rule1'],
      };

      const result = combinePrompts(baseContext, processedSections, false);
      expect(result).toContain(
        '### Context: test-context\\nmain regular prompt'
      );
    });

    it('should throw an error if no suitable prompt is found', () => {
      const contextWithoutPrompt = { ...baseContext };
      delete contextWithoutPrompt['enhanced-prompt'];
      delete contextWithoutPrompt.prompt;

      expect(() => combinePrompts(contextWithoutPrompt, {}, true)).toThrow(
        "No suitable prompt found for context 'test-context'"
      );
    });
  });
});
