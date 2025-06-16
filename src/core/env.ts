import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSafeEnvVars as getSecureSafeEnvVars } from './utils/security.js';

/**
 * Environment variable loading utility
 * Loads and manages environment variables from .env file.
 */

// Module-level state management
let loaded = false;

/**
 * Loads environment variables from .env file.
 * Finds and loads .env file from project root.
 */
export function loadEnv(): void {
  if (loaded) return;

  try {
    // Find .env file in project root
    const envPath = join(process.cwd(), '.env');

    // Simple .env file parsing (without dotenv)
    try {
      if (existsSync(envPath)) {
        const envContent = readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').replace(/^["']|["']$/g, '');
              process.env[key.trim()] = value;
            }
          }
        }
        console.info('✅ Environment variables loaded from .env file.');
      } else {
        console.warn(
          '⚠️  .env file not found. Environment variables will be loaded from system.'
        );
      }
    } catch (_parseError) {
      console.warn(
        '⚠️  Error parsing .env file. Using system environment variables only.'
      );
    }

    loaded = true;
  } catch (error) {
    console.warn('⚠️  Error loading environment variables:', error);
  }
}

/**
 * Gets environment variable value with default fallback.
 * @param key Environment variable key
 * @param defaultValue Default value if not set
 * @returns Environment variable value or default
 */
export function getEnv(key: string, defaultValue = ''): string {
  loadEnv(); // Auto-load
  return process.env[key] ?? defaultValue;
}

/**
 * Gets required environment variable value.
 * Throws error if value is not set.
 * @param key Environment variable key
 * @returns Environment variable value
 * @throws Error When environment variable is not set
 */
export function getRequiredEnv(key: string): string {
  loadEnv(); // Auto-load
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set.`);
  }
  return value;
}

/**
 * Gets safe environment variables for logging (masks sensitive values)
 */
export function getSafeEnvVars(): Record<string, string> {
  loadEnv(); // Auto-load
  return getSecureSafeEnvVars();
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv('NODE_ENV', 'development') === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnv('NODE_ENV', 'development') === 'production';
}

/**
 * Prints environment variable configuration status.
 */
export function printEnvStatus(): void {
  loadEnv();

  console.info('🔧 Environment variable configuration status:');
  console.info(`  NODE_ENV: ${process.env.NODE_ENV ?? 'not set'}`);

  if (process.env.OPENWEATHER_API_KEY) {
    console.info('  OpenWeather API: ✅ configured');
  } else {
    console.info('  OpenWeather API: ❌ not configured');
  }
}

// Object export for compatibility with existing classes
export const EnvLoader = {
  load: loadEnv,
  get: getEnv,
  getRequired: getRequiredEnv,
  printStatus: printEnvStatus,
};
