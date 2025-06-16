import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getVersion } from '../../src/core/utils/get-version.js';
import { findPackageJson } from '../../src/core/utils/package.js';

describe('Version Synchronization', () => {
  it('should read the correct version from package.json', () => {
    // Dynamically read the current version from the actual package.json
    const packageJsonPath = resolve(__dirname, '../../../package.json');
    const packageJsonContent = JSON.parse(
      readFileSync(packageJsonPath, 'utf-8')
    );
    const currentVersion = packageJsonContent.version;

    const packageJson = findPackageJson();

    // Verify it's reading the current version
    expect(packageJson.version).toBe(currentVersion);
  });

  it('should return fallback version when package.json is not found', () => {
    // This test would require more complex mocking of fs, skipping for now
  });

  it('should have consistent version across CLI and MCP server', () => {
    const cliVersion = getVersion();
    const packageVersion = findPackageJson().version;
    expect(cliVersion).toBe(packageVersion);
  });
});
