import { FileNotFoundError, YamlParseError } from '@/core/errors';
import { yamlCache } from '@/core/utils/cache';
import {
  preloadYamlFiles,
  readYamlFile,
  readYamlFiles,
} from '@/core/utils/yaml';
import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs.promises;
});

describe('YAML Utilities', () => {
  afterEach(() => {
    vol.reset();
    yamlCache.clear();
    vi.clearAllMocks();
  });

  describe('readYamlFile', () => {
    it('should read and parse a valid YAML file', async () => {
      const filePath = '/test.yaml';
      const content = 'key: value';
      vol.fromJSON({ [filePath]: content });

      const result = await readYamlFile(filePath);
      expect(result).toEqual({ key: 'value' });
    });

    it('should throw FileNotFoundError if the file does not exist', async () => {
      await expect(readYamlFile('/non-existent.yaml')).rejects.toThrow(
        FileNotFoundError
      );
    });

    it('should throw YamlParseError for invalid YAML', async () => {
      const filePath = '/invalid.yaml';
      const content = 'key: - value:';
      vol.fromJSON({ [filePath]: content });

      await expect(readYamlFile(filePath)).rejects.toThrow(YamlParseError);
    });

    it('should use the cache on subsequent reads', async () => {
      const filePath = '/cached.yaml';
      const content = 'key: value';
      vol.fromJSON({ [filePath]: content });

      const cacheSpy = vi.spyOn(yamlCache, 'get');

      await readYamlFile(filePath);
      const result = await readYamlFile(filePath);

      expect(result).toEqual({ key: 'value' });
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      // The first call is a miss, the second is a hit.
      await expect(cacheSpy.mock.results[0].value).resolves.toBeUndefined();
      await expect(cacheSpy.mock.results[1].value).resolves.toEqual({
        key: 'value',
      });
    });
  });

  describe('readYamlFiles', () => {
    it('should read and parse multiple YAML files', async () => {
      const files = {
        '/file1.yaml': 'key1: value1',
        '/file2.yaml': 'key2: value2',
      };
      vol.fromJSON(files);

      const result = await readYamlFiles(Object.keys(files));
      expect(result).toEqual([{ key1: 'value1' }, { key2: 'value2' }]);
    });
  });

  describe('preloadYamlFiles', () => {
    it('should preload files into the cache', async () => {
      const files = {
        '/file1.yaml': 'key1: value1',
        '/file2.yaml': 'key2: value2',
      };
      vol.fromJSON(files);
      const cacheSetSpy = vi.spyOn(yamlCache, 'set');

      await preloadYamlFiles(Object.keys(files));

      expect(cacheSetSpy).toHaveBeenCalledTimes(2);
      expect(cacheSetSpy).toHaveBeenCalledWith(
        'yaml:/file1.yaml',
        { key1: 'value1' },
        '/file1.yaml'
      );
      expect(cacheSetSpy).toHaveBeenCalledWith(
        'yaml:/file2.yaml',
        { key2: 'value2' },
        '/file2.yaml'
      );
    });

    it('should ignore errors for non-existent files', async () => {
      const cacheSetSpy = vi.spyOn(yamlCache, 'set');

      await preloadYamlFiles(['/non-existent.yaml']);

      expect(cacheSetSpy).not.toHaveBeenCalled();
    });
  });
});
