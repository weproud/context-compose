/**
 * Defines custom error classes for the application, providing more
 * specific error information than the generic Error class.
 */

/**
 * Base error class for all application-specific errors.
 */
export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when a required file is not found.
 */
export class FileNotFoundError extends AppError {
  constructor(filePath: string) {
    super(`File not found at path: ${filePath}`, 'FILE_NOT_FOUND');
  }
}

/**
 * Thrown when a YAML file cannot be parsed.
 */
export class YamlParseError extends AppError {
  constructor(filePath: string, originalError: Error) {
    super(
      `Failed to parse YAML file at ${filePath}: ${originalError.message}`,
      'YAML_PARSE_ERROR'
    );
  }
}

/**
 * Thrown when a context file or its components are invalid.
 */
export class InvalidContextError extends AppError {
  constructor(message: string) {
    super(message, 'INVALID_CONTEXT');
  }
}

/**
 * Thrown when the assets directory cannot be found.
 */
export class AssetsNotFoundError extends AppError {
  constructor() {
    super(
      'Could not find assets directory. Ensure context-compose is installed correctly.',
      'ASSETS_NOT_FOUND'
    );
  }
}

/**
 * Thrown when an invalid project root is provided.
 */
export class InvalidProjectRootError extends AppError {
  constructor(projectRoot: string) {
    super(
      `Invalid projectRoot provided: "${projectRoot}". Please provide a valid project directory.`,
      'INVALID_PROJECT_ROOT'
    );
  }
}
