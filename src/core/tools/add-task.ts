import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import mustache from 'mustache';
import {
  AddTaskToolSchema,
  type AddTaskToolInput,
  type AddTaskToolResponse,
} from '../../schemas/add-task.js';

// TaskItem interface removed - tasks.yaml is no longer used

/**
 * Add Task tool class
 */
export class AddTaskTool {
  /**
   * Convert Task ID to filename
   * Convert spaces to hyphens and add task- prefix
   */
  static formatTaskId(taskId: string): string {
    return taskId.trim().toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Convert Task ID to human-readable name
   */
  static formatTaskName(taskId: string): string {
    return taskId.trim();
  }

  /**
   * Variable substitution in template files (using mustache)
   */
  static replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    return mustache.render(template, variables);
  }

  /**
   * Find template file path in .taskaction directory
   */
  static async findTaskactionTemplatePath(
    projectRoot: string,
    configPath: string
  ): Promise<string | null> {
    // Search in .taskaction/templates directory
    try {
      const taskactionTemplatePath = join(
        projectRoot,
        configPath,
        'templates',
        'feature-task.mustache'
      );
      if (existsSync(taskactionTemplatePath)) {
        return taskactionTemplatePath;
      }
    } catch (error) {
      // Ignore if not found in .taskaction
    }

    return null;
  }

  /**
   * Read template file
   */
  static async readTemplate(
    projectRoot: string,
    configPath: string
  ): Promise<string> {
    // Find .taskaction/templates/task-template.mustache file
    const taskactionTemplatePath = await this.findTaskactionTemplatePath(
      projectRoot,
      configPath
    );

    if (taskactionTemplatePath) {
      try {
        return readFileSync(taskactionTemplatePath, 'utf8');
      } catch (error) {
        throw new Error(
          `Cannot read template file: ${taskactionTemplatePath}\n` +
            `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    throw new Error(
      `Cannot find .taskaction/templates/feature-task.mustache file.\n` +
        `Please check if the file exists at the following location:\n` +
        `1. ${projectRoot}/${configPath}/templates/feature-task.mustache\n` +
        `Please initialize the project first with 'task-action init' command.`
    );
  }

  /**
   * Create task file
   */
  static createTaskFile(
    taskId: string,
    content: string,
    projectRoot: string,
    configPath: string
  ): string {
    const formattedId = this.formatTaskId(taskId);
    const fileName = `task-${formattedId}.yaml`;
    const filePath = join(projectRoot, configPath, fileName);

    if (existsSync(filePath)) {
      throw new Error(
        `Task file already exists: ${fileName}\n` +
          'Please use a different Task ID or delete the existing file.'
      );
    }

    try {
      writeFileSync(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      throw new Error(
        `Cannot create task file: ${filePath}\n` +
          `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // tasks.yaml related methods removed - no longer used

  /**
   * Add Task core logic
   */
  static async execute(input: AddTaskToolInput): Promise<AddTaskToolResponse> {
    const { taskId, projectRoot, configPath } = input;

    try {
      // 1. Read template file
      const template = await this.readTemplate(projectRoot, configPath);

      // 2. Prepare variables
      const formattedId = this.formatTaskId(taskId);
      const formattedName = this.formatTaskName(taskId);
      const variables = {
        id: formattedId,
        name: formattedName,
        description: `Task for ${formattedName}`,
        prompt: `Task: ${formattedName}`,
      };

      // 3. Template variable substitution
      const content = this.replaceTemplateVariables(template, variables);

      // 4. Create task file
      const filePath = this.createTaskFile(
        taskId,
        content,
        projectRoot,
        configPath
      );
      const fileName = `task-${formattedId}.yaml`;

      const successMessage = `✅ Task file created successfully: ${fileName}`;

      return {
        success: true,
        message: successMessage,
        taskId: formattedId,
        fileName,
        filePath,
        tasksYamlUpdated: false, // tasks.yaml is no longer used
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `❌ Failed to create task file: ${errorMessage}`,
        taskId: this.formatTaskId(taskId),
        fileName: `task-${this.formatTaskId(taskId)}.yaml`,
        tasksYamlUpdated: false,
      };
    }
  }

  /**
   * Input validation and execution
   */
  static async executeWithValidation(
    args: unknown
  ): Promise<AddTaskToolResponse> {
    // Validate input with Zod schema
    const validatedInput = AddTaskToolSchema.parse(args);

    // Execute business logic
    return this.execute(validatedInput);
  }

  /**
   * CLI helper function - direct parameter passing
   */
  static async executeFromParams(
    taskId: string,
    projectRoot: string,
    configPath = '.taskaction'
  ): Promise<AddTaskToolResponse> {
    return this.execute({
      taskId,
      projectRoot,
      configPath,
      enhancedPrompt: false,
    });
  }
}

/**
 * Simple functional interface (optional)
 */
export async function addTask(
  taskId: string,
  projectRoot: string,
  configPath = '.taskaction'
): Promise<AddTaskToolResponse> {
  return AddTaskTool.executeFromParams(taskId, projectRoot, configPath);
}

/**
 * MCP tool helper function
 */
export async function executeAddTaskTool(
  args: unknown
): Promise<AddTaskToolResponse> {
  return AddTaskTool.executeWithValidation(args);
}
