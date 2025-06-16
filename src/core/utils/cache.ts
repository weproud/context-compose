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
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
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
  }) as T;
}

/**
 * Async memoization decorator
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T {
  const cache = new Map<
    string,
    { result: Awaited<ReturnType<T>>; timestamp: number }
  >();

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result;
    }

    const result = await fn(...args);
    cache.set(key, { result, timestamp: Date.now() });
    return result;
  }) as T;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static metrics = new Map<
    string,
    { count: number; totalTime: number; avgTime: number }
  >();

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): void {
    PerformanceMonitor.timers.set(operation, performance.now());
  }

  /**
   * End timing an operation and record metrics
   */
  static endTimer(operation: string): number {
    const startTime = PerformanceMonitor.timers.get(operation);
    if (!startTime) {
      throw new Error(`Timer for operation '${operation}' was not started`);
    }

    const duration = performance.now() - startTime;
    PerformanceMonitor.timers.delete(operation);

    // Update metrics
    const existing = PerformanceMonitor.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
    };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    PerformanceMonitor.metrics.set(operation, existing);

    return duration;
  }

  /**
   * Get performance metrics for an operation
   */
  static getMetrics(
    operation: string
  ): { count: number; totalTime: number; avgTime: number } | undefined {
    return PerformanceMonitor.metrics.get(operation);
  }

  /**
   * Get all performance metrics
   */
  static getAllMetrics(): Record<
    string,
    { count: number; totalTime: number; avgTime: number }
  > {
    return Object.fromEntries(PerformanceMonitor.metrics);
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    PerformanceMonitor.timers.clear();
    PerformanceMonitor.metrics.clear();
  }

  /**
   * Decorator for timing function execution
   */
  static timeFunction<T extends (...args: any[]) => any>(
    fn: T,
    operationName?: string
  ): T {
    const name = operationName || fn.name || 'anonymous';

    return ((...args: Parameters<T>): ReturnType<T> => {
      PerformanceMonitor.startTimer(name);
      try {
        const result = fn(...args);

        // Handle async functions
        if (result instanceof Promise) {
          return result.finally(() =>
            PerformanceMonitor.endTimer(name)
          ) as ReturnType<T>;
        }

        PerformanceMonitor.endTimer(name);
        return result;
      } catch (error) {
        PerformanceMonitor.endTimer(name);
        throw error;
      }
    }) as T;
  }
}
