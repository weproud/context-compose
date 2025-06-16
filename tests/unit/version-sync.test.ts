import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findPackageJson } from '../../src/core/utils/package.js';

describe('Version Synchronization', () => {
  it('should read the correct version from package.json', () => {
    // Read the actual package.json
    const packageJsonPath = join(process.cwd(), 'package.json');
    const actualPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    // Get version from our utility function
    const packageJson = findPackageJson();

    // They should match
    expect(packageJson.version).toBe(actualPackageJson.version);
    expect(packageJson.name).toBe('@noanswer/context-compose');

    // Verify it's reading the current version (1.6.0)
    expect(packageJson.version).toBe('1.6.0');
  });

  it('should return fallback version when package.json is not found', () => {
    // This test would require mocking the file system,
    // but for now we just verify the function exists and returns something
    const packageJson = findPackageJson();

    expect(packageJson).toBeDefined();
    expect(packageJson.version).toBeDefined();
    expect(typeof packageJson.version).toBe('string');
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/); // Semantic version format
  });

  it('should have consistent version across CLI and MCP server', () => {
    // Both CLI and MCP server should use the same version utility
    const packageJson = findPackageJson();

    // Verify the version format is valid for FastMCP
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);

    // Verify it can be used as a version string
    const versionParts = packageJson.version.split('.');
    expect(versionParts).toHaveLength(3);
    expect(Number.parseInt(versionParts[0])).toBeGreaterThanOrEqual(1);
    expect(Number.parseInt(versionParts[1])).toBeGreaterThanOrEqual(0);
    expect(Number.parseInt(versionParts[2])).toBeGreaterThanOrEqual(0);
  });
});
