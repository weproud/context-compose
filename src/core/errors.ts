/**
 * Defines custom error classes for the application, providing more
 * specific error information than the generic Error class.
 */

/**
 * Base error class for all application-specific errors.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Convert error to a user-friendly message
   */
  toUserMessage(): string {
    return this.message;
  }

  /**
   * Convert error to structured log format
   */
  toLogFormat(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Thrown when a required file is not found.
 */
export class FileNotFoundError extends AppError {
  constructor(filePath: string) {
    super(`File not found at path: ${filePath}`, 'FILE_NOT_FOUND', 404, {
      filePath,
    });
  }

  toUserMessage(): string {
    return 'The required file could not be found. Please check if the file exists and try again.';
  }
}

/**
 * Thrown when a YAML file cannot be parsed.
 */
export class YamlParseError extends AppError {
  constructor(filePath: string, originalError: Error) {
    super(
      `Failed to parse YAML file at ${filePath}: ${originalError.message}`,
      'YAML_PARSE_ERROR',
      400,
      { filePath, originalError: originalError.message }
    );
  }

  toUserMessage(): string {
    return 'The configuration file contains invalid syntax. Please check the YAML format and try again.';
  }
}

/**
 * Thrown when a context file or its components are invalid.
 */
export class InvalidContextError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_CONTEXT', 400, details);
  }

  toUserMessage(): string {
    return 'The context configuration is invalid. Please check your context files and try again.';
  }
}

/**
 * Thrown when the assets directory cannot be found.
 */
export class AssetsNotFoundError extends AppError {
  constructor() {
    super(
      'Could not find assets directory. Ensure context-compose is installed correctly.',
      'ASSETS_NOT_FOUND',
      500
    );
  }

  toUserMessage(): string {
    return 'Installation error: Required assets not found. Please reinstall context-compose.';
  }
}

/**
 * Thrown when an invalid project root is provided.
 */
export class InvalidProjectRootError extends AppError {
  constructor(projectRoot: string) {
    super(
      `Invalid projectRoot provided: "${projectRoot}". Please provide a valid project directory.`,
      'INVALID_PROJECT_ROOT',
      400,
      { projectRoot }
    );
  }

  toUserMessage(): string {
    return 'Invalid project directory. Please provide a valid project path.';
  }
}

/**
 * Handle error and return user-friendly message
 */
export function handleError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
} {
  if (error instanceof AppError) {
    const result: {
      message: string;
      code: string;
      statusCode: number;
      details?: Record<string, unknown>;
    } = {
      message: error.toUserMessage(),
      code: error.code,
      statusCode: error.statusCode,
    };

    if (error.details) {
      result.details = error.details;
    }

    return result;
  }

  if (error instanceof Error) {
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      details: { originalMessage: error.message },
    };
  }

  return {
    message: 'An unknown error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    details: { error: String(error) },
  };
}

/**
 * Log error in structured format
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    console.error(`[${timestamp}] ERROR:`, {
      ...error.toLogFormat(),
      context,
    });
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] ERROR:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });
  } else {
    console.error(`[${timestamp}] ERROR:`, {
      error: String(error),
      context,
    });
  }
}

/**
 * Check if error is recoverable
 */
export function isRecoverable(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.statusCode < 500;
  }
  return false;
}
