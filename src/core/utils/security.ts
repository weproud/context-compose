import { isAbsolute, normalize, relative, resolve } from 'node:path';
import { z } from 'zod';

/**
 * Security utilities for path validation and input sanitization
 */

/**
 * Path traversal attack prevention
 */
export class PathValidator {
  private allowedBasePaths: Set<string>;

  constructor(allowedBasePaths: string[] = []) {
    this.allowedBasePaths = new Set(
      allowedBasePaths.map((path) => resolve(normalize(path)))
    );
  }

  /**
   * Validate that a path is safe and within allowed directories
   */
  validatePath(inputPath: string, basePath?: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Invalid path: path must be a non-empty string');
    }

    // Normalize and resolve the path
    const normalizedPath = normalize(inputPath);

    // Check for path traversal attempts
    if (normalizedPath.includes('..')) {
      throw new Error('Invalid path: path traversal detected');
    }

    // If basePath is provided, ensure the path is within it
    if (basePath) {
      const resolvedBasePath = resolve(normalize(basePath));
      const resolvedInputPath = isAbsolute(normalizedPath)
        ? resolve(normalizedPath)
        : resolve(resolvedBasePath, normalizedPath);

      const relativePath = relative(resolvedBasePath, resolvedInputPath);

      if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        throw new Error(`Invalid path: path must be within ${basePath}`);
      }

      return resolvedInputPath;
    }

    // Check against allowed base paths if configured
    if (this.allowedBasePaths.size > 0) {
      const resolvedPath = resolve(normalizedPath);
      const isAllowed = Array.from(this.allowedBasePaths).some((basePath) => {
        const relativePath = relative(basePath, resolvedPath);
        return !relativePath.startsWith('..') && !isAbsolute(relativePath);
      });

      if (!isAllowed) {
        throw new Error('Invalid path: path not within allowed directories');
      }
    }

    return resolve(normalizedPath);
  }

  /**
   * Validate context compose specific paths
   */
  validateContextPath(inputPath: string, projectRoot: string): string {
    const contextDir = resolve(projectRoot, '.contextcompose');
    return this.validatePath(inputPath, contextDir);
  }

  /**
   * Add allowed base path
   */
  addAllowedPath(basePath: string): void {
    this.allowedBasePaths.add(resolve(normalize(basePath)));
  }
}

/**
 * Input validation schemas
 */
export const SecuritySchemas = {
  // Safe filename (no path separators, no special chars)
  safeFilename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters'),

  // Context name validation
  contextName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9-_]+$/, 'Context name contains invalid characters'),

  // Project root path validation
  projectRoot: z
    .string()
    .min(1)
    .refine(
      (path) => !path.includes('..'),
      'Project root cannot contain path traversal'
    ),

  // YAML file extension
  yamlFile: z
    .string()
    .regex(/\.ya?ml$/i, 'File must have .yaml or .yml extension'),
};

/**
 * Sanitize string input by removing dangerous characters
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  return input
    .slice(0, maxLength)
    .replace(/[\p{Cc}]/gu, '') // Remove control characters using Unicode property
    .replace(/<[^>]*>/g, '') // Remove HTML/XML tags completely
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .trim();
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255);
}

/**
 * Validate and sanitize context name
 */
export function sanitizeContextName(contextName: string): string {
  if (!contextName || typeof contextName !== 'string') {
    throw new Error('Context name must be a non-empty string');
  }

  const sanitized = contextName
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .slice(0, 100);

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Context name cannot be empty after sanitization');
  }

  return sanitized;
}

/**
 * Environment variable security
 */
const sensitiveKeys = new Set([
  'password',
  'secret',
  'key',
  'token',
  'api_key',
  'private_key',
  'auth',
  'credential',
  'cert',
  'ssl',
  'tls',
]);

/**
 * Check if environment variable key is sensitive
 */
export function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return Array.from(sensitiveKeys).some((sensitive) =>
    lowerKey.includes(sensitive)
  );
}

/**
 * Mask sensitive environment variable value
 */
export function maskSensitiveValue(key: string, value: string): string {
  if (isSensitiveKey(key)) {
    if (value.length <= 4) {
      return '***';
    }
    // Show first 2 and last 2 characters with asterisks for the middle
    const middleLength = value.length - 4;
    return `${value.slice(0, 2)}${'*'.repeat(middleLength)}${value.slice(-2)}`;
  }
  return value;
}

/**
 * Get safe environment variables for logging
 */
export function getSafeEnvVars(): Record<string, string> {
  const safeVars: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      safeVars[key] = maskSensitiveValue(key, value);
    }
  }

  return safeVars;
}

/**
 * Rate limiting for security
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  /**
   * Clear old entries periodically
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of this.requests) {
      const validRequests = requests.filter(
        (time) => now - time < this.windowMs
      );
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

/**
 * Global instances
 */
export const defaultPathValidator = new PathValidator();
export const defaultRateLimiter = new RateLimiter();

// Cleanup rate limiter every 5 minutes
setInterval(() => defaultRateLimiter.cleanup(), 5 * 60 * 1000);
