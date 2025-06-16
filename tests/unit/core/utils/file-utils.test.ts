import {
  backupDirectory,
  copyDirectory,
  fileExists,
} from '@/core/utils/file-utils';
import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs.promises;
});

describe('File Utilities', () => {
  afterEach(() => {
    vol.reset();
  });

  describe('fileExists', () => {
    it('should return true if the file exists', async () => {
      vol.fromJSON({ '/test.txt': 'hello' });
      await expect(fileExists('/test.txt')).resolves.toBe(true);
    });

    it('should return false if the file does not exist', async () => {
      await expect(fileExists('/non-existent.txt')).resolves.toBe(false);
    });
  });

  describe('copyDirectory', () => {
    it('should recursively copy a directory', async () => {
      const structure = {
        './src/file1.txt': 'file1 content',
        './src/subdir/file2.txt': 'file2 content',
      };
      vol.fromJSON(structure, '/app');

      const copiedFiles = await copyDirectory('/app/src', '/app/dest');

      expect(copiedFiles).toHaveLength(2);
      expect(vol.existsSync('/app/dest/file1.txt')).toBe(true);
      expect(vol.existsSync('/app/dest/subdir/file2.txt')).toBe(true);
      expect(vol.readFileSync('/app/dest/subdir/file2.txt', 'utf-8')).toBe(
        'file2 content'
      );
    });
  });

  describe('backupDirectory', () => {
    it('should rename the directory with a timestamp', async () => {
      const date = new Date('2024-01-01T12:30:00.000Z');
      vi.setSystemTime(date);

      vol.fromJSON(
        {
          './my-dir/file.txt': 'content',
        },
        '/app'
      );

      const backupPath = await backupDirectory('/app/my-dir');
      const expectedPath = '/app/my-dir-2024-01-01_12-30-00';

      expect(backupPath).toBe(expectedPath);
      expect(vol.existsSync(expectedPath)).toBe(true);
      expect(vol.existsSync('/app/my-dir')).toBe(false);
      expect(vol.existsSync(`${expectedPath}/file.txt`)).toBe(true);

      vi.useRealTimers();
    });
  });
});
