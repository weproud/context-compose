import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
  ttl?: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
  maxSize: number;
  defaultTtl: number; // in milliseconds
}

/**
 * High-performance in-memory cache with TTL and file change detection
 */
export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      defaultTtl: config.defaultTtl ?? 5 * 60 * 1000, // 5 minutes
    };
  }

  /**
   * Get cached value with file change detection
   */
  async get(key: string, filePath?: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (entry.ttl && Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return undefined;
    }

    // Check file changes if filePath provided
    if (filePath) {
      try {
        const currentHash = await this.getFileHash(filePath);
        if (currentHash !== entry.hash) {
          this.cache.delete(key);
          this.accessOrder.delete(key);
          return undefined;
        }
      } catch {
        // File doesn't exist or can't be read, invalidate cache
        this.cache.delete(key);
        this.accessOrder.delete(key);
        return undefined;
      }
    }

    // Update access order for LRU
    this.accessOrder.set(key, ++this.accessCounter);
    return entry.data;
  }

  /**
   * Set cached value
   */
  async set(
    key: string,
    value: T,
    filePath?: string,
    ttl?: number
  ): Promise<void> {
    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const hash = filePath ? await this.getFileHash(filePath) : '';
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      hash,
      ttl: ttl ?? this.config.defaultTtl,
    };

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    this.accessOrder.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need hit/miss tracking
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Get file hash for change detection
   */
  private async getFileHash(filePath: string): Promise<string> {
    try {
      const stats = await stat(filePath);
      const content = await readFile(filePath, 'utf8');
      return createHash('sha256')
        .update(`${stats.mtime.getTime()}-${content.length}`)
        .digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Number.MAX_SAFE_INTEGER;

    for (const [key, access] of this.accessOrder) {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // Overhead for timestamps, etc.
    }
    return size;
  }
}

/**
 * Global cache instances
 */
export const yamlCache = new MemoryCache<unknown>({
  maxSize: 500,
  defaultTtl: 10 * 60 * 1000, // 10 minutes for YAML files
});

export const fileCache = new MemoryCache<string>({
  maxSize: 200,
  defaultTtl: 5 * 60 * 1000, // 5 minutes for file content
});

/**
 * Memoization decorator for functions
 */
export function memoize<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyGenerator?: (...args: TArgs) => string
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();

  return (...args: TArgs): TReturn => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      const cached = cache.get(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Async memoization decorator
 */
export function memoizeAsync<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyGenerator?: (...args: TArgs) => string,
  ttl: number = 5 * 60 * 1000
): (...args: TArgs) => Promise<TReturn> {
  const cache = new Map<string, { result: TReturn; timestamp: number }>();

  return async (...args: TArgs): Promise<TReturn> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result;
    }

    const result = await fn(...args);
    cache.set(key, { result, timestamp: Date.now() });
    return result;
  };
}

/**
 * Performance monitoring utilities
 */
const timers = new Map<string, number>();
const metrics = new Map<
  string,
  { count: number; totalTime: number; avgTime: number }
>();

/**
 * Start timing an operation
 */
export function startTimer(operation: string): void {
  timers.set(operation, performance.now());
}

/**
 * End timing an operation and record metrics
 */
export function endTimer(operation: string): number {
  const startTime = timers.get(operation);
  if (!startTime) {
    throw new Error(`Timer for operation '${operation}' was not started`);
  }

  const duration = performance.now() - startTime;
  timers.delete(operation);

  // Update metrics
  const existing = metrics.get(operation) || {
    count: 0,
    totalTime: 0,
    avgTime: 0,
  };
  existing.count++;
  existing.totalTime += duration;
  existing.avgTime = existing.totalTime / existing.count;
  metrics.set(operation, existing);

  return duration;
}

/**
 * Get performance metrics for an operation
 */
export function getMetrics(
  operation: string
): { count: number; totalTime: number; avgTime: number } | undefined {
  return metrics.get(operation);
}

/**
 * Get all performance metrics
 */
export function getAllMetrics(): Record<
  string,
  { count: number; totalTime: number; avgTime: number }
> {
  return Object.fromEntries(metrics);
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  timers.clear();
  metrics.clear();
}

/**
 * Decorator for timing function execution
 */
export function timeFunction<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  operationName?: string
): (...args: TArgs) => TReturn {
  const name = operationName || fn.name || 'anonymous';

  return (...args: TArgs): TReturn => {
    startTimer(name);
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => endTimer(name)) as TReturn;
      }

      endTimer(name);
      return result;
    } catch (error) {
      endTimer(name);
      throw error;
    }
  };
}
