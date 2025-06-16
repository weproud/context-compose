import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  AppError,
  FileNotFoundError,
  YamlParseError,
  InvalidContextError,
  AssetsNotFoundError,
  InvalidProjectRootError,
  handleError,
  logError,
  isRecoverable,
} from '../../src/core/errors.js';

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400, {
        key: 'value',
      });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ key: 'value' });
      expect(error.name).toBe('AppError');
    });

    it('should have default statusCode of 500', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should convert to user message', () => {
      const error = new AppError('Technical error', 'TEST_ERROR');
      expect(error.toUserMessage()).toBe('Technical error');
    });

    it('should convert to log format', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400, {
        key: 'value',
      });
      const logFormat = error.toLogFormat();

      expect(logFormat).toMatchObject({
        name: 'AppError',
        message: 'Test error',
        code: 'TEST_ERROR',
        statusCode: 400,
        details: { key: 'value' },
      });
      expect(logFormat.stack).toBeDefined();
    });
  });

  describe('Specific Error Classes', () => {
    it('should create FileNotFoundError with correct properties', () => {
      const error = new FileNotFoundError('/path/to/file');

      expect(error.code).toBe('FILE_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.details).toEqual({ filePath: '/path/to/file' });
      expect(error.toUserMessage()).toContain(
        'required file could not be found'
      );
    });

    it('should create YamlParseError with correct properties', () => {
      const originalError = new Error('Invalid YAML syntax');
      const error = new YamlParseError('/path/to/file.yaml', originalError);

      expect(error.code).toBe('YAML_PARSE_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({
        filePath: '/path/to/file.yaml',
        originalError: 'Invalid YAML syntax',
      });
      expect(error.toUserMessage()).toContain(
        'configuration file contains invalid syntax'
      );
    });

    it('should create InvalidContextError with correct properties', () => {
      const error = new InvalidContextError('Invalid context', {
        context: 'test',
      });

      expect(error.code).toBe('INVALID_CONTEXT');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ context: 'test' });
      expect(error.toUserMessage()).toContain(
        'context configuration is invalid'
      );
    });

    it('should create AssetsNotFoundError with correct properties', () => {
      const error = new AssetsNotFoundError();

      expect(error.code).toBe('ASSETS_NOT_FOUND');
      expect(error.statusCode).toBe(500);
      expect(error.toUserMessage()).toContain('Installation error');
    });

    it('should create InvalidProjectRootError with correct properties', () => {
      const error = new InvalidProjectRootError('/invalid/path');

      expect(error.code).toBe('INVALID_PROJECT_ROOT');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ projectRoot: '/invalid/path' });
      expect(error.toUserMessage()).toContain('Invalid project directory');
    });
  });

  describe('ErrorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new FileNotFoundError('/path/to/file');
      const result = handleError(error);

      expect(result).toEqual({
        message: error.toUserMessage(),
        code: 'FILE_NOT_FOUND',
        statusCode: 404,
        details: { filePath: '/path/to/file' },
      });
    });

    it('should handle generic Error correctly', () => {
      const error = new Error('Generic error');
      const result = handleError(error);

      expect(result).toEqual({
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        details: { originalMessage: 'Generic error' },
      });
    });

    it('should handle unknown error correctly', () => {
      const error = 'String error';
      const result = handleError(error);

      expect(result).toEqual({
        message: 'An unknown error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        details: { error: 'String error' },
      });
    });

    it('should identify recoverable errors', () => {
      const recoverableError = new FileNotFoundError('/path');
      const nonRecoverableError = new AssetsNotFoundError();
      const genericError = new Error('Generic');

      expect(isRecoverable(recoverableError)).toBe(true);
      expect(isRecoverable(nonRecoverableError)).toBe(false);
      expect(isRecoverable(genericError)).toBe(false);
    });

    it('should log errors with structured format', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new FileNotFoundError('/path/to/file');
      const context = { command: 'test' };

      logError(error, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ERROR:$/
        ),
        expect.objectContaining({
          name: 'FileNotFoundError',
          code: 'FILE_NOT_FOUND',
          context,
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
