import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSafeEnvVars,
  isSensitiveKey,
  maskSensitiveValue,
  PathValidator,
  RateLimiter,
  sanitizeContextName,
  sanitizeFilename,
  sanitizeString,
  SecuritySchemas,
} from '../../src/core/utils/security.js';

describe('Security Utilities', () => {
  describe('PathValidator', () => {
    let validator: PathValidator;
    let testDir: string;

    beforeEach(() => {
      testDir = resolve(tmpdir(), 'context-compose-security-test');
      validator = new PathValidator([testDir]);
    });

    it('should validate safe paths', () => {
      const safePath = join(testDir, 'safe', 'file.txt');
      expect(() => validator.validatePath(safePath, testDir)).not.toThrow();
    });

    it('should reject path traversal attempts', () => {
      expect(() => validator.validatePath('../../../etc/passwd')).toThrow(
        'path traversal detected'
      );
      expect(() => validator.validatePath('safe/../../../etc/passwd')).toThrow(
        'path traversal detected'
      );
    });

    it('should reject paths outside allowed directories', () => {
      const outsidePath = '/etc/passwd';
      expect(() => validator.validatePath(outsidePath, testDir)).toThrow(
        'path must be within'
      );
    });

    it('should validate context paths correctly', () => {
      const contextPath = join(
        testDir,
        '.contextcompose',
        'feature-context.yaml'
      );
      expect(() =>
        validator.validateContextPath(contextPath, testDir)
      ).not.toThrow();

      const maliciousPath = join(
        testDir,
        '.contextcompose',
        '../../../etc/passwd'
      );
      expect(() =>
        validator.validateContextPath(maliciousPath, testDir)
      ).toThrow();
    });

    it('should handle empty or invalid paths', () => {
      expect(() => validator.validatePath('')).toThrow('Invalid path');
      expect(() => validator.validatePath(null as any)).toThrow('Invalid path');
      expect(() => validator.validatePath(123 as any)).toThrow('Invalid path');
    });
  });

  describe('SecuritySchemas', () => {
    it('should validate safe filenames', () => {
      expect(() =>
        SecuritySchemas.safeFilename.parse('valid-file.yaml')
      ).not.toThrow();
      expect(() =>
        SecuritySchemas.safeFilename.parse('valid_file123.yml')
      ).not.toThrow();

      expect(() =>
        SecuritySchemas.safeFilename.parse('invalid/file.yaml')
      ).toThrow();
      expect(() =>
        SecuritySchemas.safeFilename.parse('invalid\\file.yaml')
      ).toThrow();
      expect(() =>
        SecuritySchemas.safeFilename.parse('invalid<file>.yaml')
      ).toThrow();
    });

    it('should validate context names', () => {
      expect(() =>
        SecuritySchemas.contextName.parse('valid-context')
      ).not.toThrow();
      expect(() =>
        SecuritySchemas.contextName.parse('valid_context123')
      ).not.toThrow();

      expect(() =>
        SecuritySchemas.contextName.parse('invalid context')
      ).toThrow();
      expect(() =>
        SecuritySchemas.contextName.parse('invalid/context')
      ).toThrow();
      expect(() =>
        SecuritySchemas.contextName.parse('invalid.context')
      ).toThrow();
    });

    it('should validate project root paths', () => {
      expect(() =>
        SecuritySchemas.projectRoot.parse('/valid/project/root')
      ).not.toThrow();
      expect(() =>
        SecuritySchemas.projectRoot.parse('./valid/relative/path')
      ).not.toThrow();

      expect(() =>
        SecuritySchemas.projectRoot.parse('../invalid/path')
      ).toThrow();
      expect(() =>
        SecuritySchemas.projectRoot.parse('/path/with/../traversal')
      ).toThrow();
    });

    it('should validate YAML file extensions', () => {
      expect(() => SecuritySchemas.yamlFile.parse('file.yaml')).not.toThrow();
      expect(() => SecuritySchemas.yamlFile.parse('file.yml')).not.toThrow();

      expect(() => SecuritySchemas.yamlFile.parse('file.txt')).toThrow();
      expect(() => SecuritySchemas.yamlFile.parse('file.json')).toThrow();
    });
  });

  describe('InputSanitizer', () => {
    it('should sanitize strings by removing dangerous characters', () => {
      const input = 'Hello\x00World\x1f<script>alert("xss")</script>';
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe('HelloWorldalert("xss")');
    });

    it('should limit string length', () => {
      const longString = 'a'.repeat(2000);
      const sanitized = sanitizeString(longString, 100);
      expect(sanitized).toHaveLength(100);
    });

    it('should sanitize filenames', () => {
      expect(sanitizeFilename('valid-file.txt')).toBe('valid-file.txt');
      expect(sanitizeFilename('invalid/file<name>.txt')).toBe(
        'invalid_file_name_.txt'
      );
      expect(sanitizeFilename('file with spaces.txt')).toBe(
        'file_with_spaces.txt'
      );
    });

    it('should sanitize context names', () => {
      expect(sanitizeContextName('ValidContext')).toBe('validcontext');
      expect(sanitizeContextName('Invalid Context!')).toBe('invalid-context');
      expect(sanitizeContextName('context--with--dashes')).toBe(
        'context-with-dashes'
      );
    });

    it('should throw error for empty context names', () => {
      expect(() => sanitizeContextName('')).toThrow();
      expect(() => sanitizeContextName('!!!')).toThrow();
    });
  });

  describe('EnvSecurity', () => {
    it('should identify sensitive environment variable keys', () => {
      expect(isSensitiveKey('API_KEY')).toBe(true);
      expect(isSensitiveKey('DATABASE_PASSWORD')).toBe(true);
      expect(isSensitiveKey('JWT_SECRET')).toBe(true);
      expect(isSensitiveKey('SSL_PRIVATE_KEY')).toBe(true);

      expect(isSensitiveKey('NODE_ENV')).toBe(false);
      expect(isSensitiveKey('PORT')).toBe(false);
      expect(isSensitiveKey('DEBUG')).toBe(false);
    });

    it('should mask sensitive values', () => {
      expect(maskSensitiveValue('API_KEY', 'secret123')).toBe('se*****23');
      expect(maskSensitiveValue('PASSWORD', 'verylongpassword')).toBe(
        've************rd'
      );
      expect(maskSensitiveValue('SHORT_KEY', 'abc')).toBe('***');

      expect(maskSensitiveValue('NODE_ENV', 'production')).toBe('production');
    });

    it('should get safe environment variables', () => {
      // Set test environment variables
      process.env.TEST_API_KEY = 'secret123';
      process.env.TEST_NODE_ENV = 'test';

      const safeVars = getSafeEnvVars();

      expect(safeVars.TEST_API_KEY).toBe('se*****23');
      expect(safeVars.TEST_NODE_ENV).toBe('test');

      // Cleanup
      delete process.env.TEST_API_KEY;
      delete process.env.TEST_NODE_ENV;
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000); // 3 requests per second
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should reject requests exceeding limit', () => {
      // Use up the limit
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');

      // This should be rejected
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('should handle different identifiers separately', () => {
      // Use up limit for user1
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');

      // user2 should still be allowed
      expect(rateLimiter.isAllowed('user2')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('should reset after time window', async () => {
      const shortLimiter = new RateLimiter(1, 100); // 1 request per 100ms

      expect(shortLimiter.isAllowed('user1')).toBe(true);
      expect(shortLimiter.isAllowed('user1')).toBe(false);

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(shortLimiter.isAllowed('user1')).toBe(true);
    });

    it('should cleanup old entries', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');

      // Cleanup should not throw
      expect(() => rateLimiter.cleanup()).not.toThrow();
    });
  });

  describe('Security Integration', () => {
    it('should validate complete context file path', () => {
      const validator = new PathValidator();
      const projectRoot = '/safe/project';
      const contextName = 'feature-context';

      // This should pass all validations
      expect(() => {
        SecuritySchemas.projectRoot.parse(projectRoot);
        SecuritySchemas.contextName.parse(contextName);
        const contextPath = join(
          projectRoot,
          '.contextcompose',
          `${contextName}.yaml`
        );
        validator.validateContextPath(contextPath, projectRoot);
      }).not.toThrow();
    });

    it('should reject malicious context operations', () => {
      const validator = new PathValidator();
      const projectRoot = '/safe/project';

      // Path traversal in context name
      expect(() => {
        const maliciousContext = '../../../etc/passwd';
        SecuritySchemas.contextName.parse(maliciousContext);
      }).toThrow();

      // Path traversal in project root
      expect(() => {
        const maliciousRoot = '/safe/../../../etc';
        SecuritySchemas.projectRoot.parse(maliciousRoot);
      }).toThrow();
    });
  });
});
