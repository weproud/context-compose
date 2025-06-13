import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const assetsDir = path.join(process.cwd(), 'assets');
const requiredKeys = [
  'version',
  'kind',
  'name',
  'description',
  'prompt',
  'enhanced-prompt',
];
const validKinds = ['action', 'mcp', 'persona', 'rule', 'context'];

const getYamlFiles = (dir: string): string[] => {
  let files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getYamlFiles(fullPath));
    } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
      files.push(fullPath);
    }
  }

  return files;
};

describe('Validate assets YAML files', () => {
  const yamlFiles = getYamlFiles(assetsDir);

  yamlFiles.forEach(filePath => {
    const relativePath = path.relative(assetsDir, filePath);

    describe(`File: ${relativePath}`, () => {
      let parsedYaml: any;

      it('should be valid YAML', () => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        parsedYaml = yaml.parse(fileContent);
        expect(parsedYaml).toBeDefined();
      });

      it('should have all required keys', () => {
        for (const key of requiredKeys) {
          expect(parsedYaml).toHaveProperty(key);
        }
      });

      it('should have a valid kind', () => {
        expect(validKinds).toContain(parsedYaml.kind);
      });

      it('should have a kind that matches its directory', () => {
        const dir = path.dirname(relativePath);
        const kind = parsedYaml.kind;

        if (dir === 'actions') {
          expect(kind).toBe('action');
        } else if (dir === 'mcps') {
          expect(kind).toBe('mcp');
        } else if (dir === 'personas') {
          expect(kind).toBe('persona');
        } else if (dir === 'rules') {
          expect(kind).toBe('rule');
        } else if (dir === '.') {
          expect(kind).toBe('context');
        } else {
          // This case should not be reached if directory structure is correct
          // but we add a failing test to be explicit.
          expect(`Unknown directory for kind validation: ${dir}`).toBe('');
        }
      });
    });
  });
});
