import { readFileSync, writeFileSync, existsSync } from 'fs-extra';
import { join } from 'path';
import mustache from 'mustache';
import {
  AddTaskToolSchema,
  type AddTaskToolInput,
  type AddTaskToolResponse,
} from '../../schemas/add-task.js';

/**
 * Task 항목 타입
 */
export interface TaskItem {
  id: string;
  status: string;
}

/**
 * Add Task 도구 클래스
 */
export class AddTaskTool {
  /**
   * Task ID를 파일명으로 변환
   * 공백을 하이픈으로 변환하고 task- 접두사 추가
   */
  static formatTaskId(taskId: string): string {
    return taskId.trim().toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Task ID를 사람이 읽기 쉬운 이름으로 변환
   */
  static formatTaskName(taskId: string): string {
    return taskId.trim();
  }

  /**
   * 템플릿 파일에서 변수 치환 (mustache 사용)
   */
  static replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    return mustache.render(template, variables);
  }

  /**
   * .taskaction 디렉토리에서 템플릿 파일 경로 찾기
   */
  static async findTaskactionTemplatePath(
    configPath: string
  ): Promise<string | null> {
    // .taskaction/templates 디렉토리에서 찾기
    try {
      const taskactionTemplatePath = join(
        process.cwd(),
        configPath,
        'templates',
        'task-template.mustache'
      );
      if (existsSync(taskactionTemplatePath)) {
        return taskactionTemplatePath;
      }
    } catch (error) {
      // .taskaction에서 찾지 못한 경우 무시
    }

    return null;
  }

  /**
   * 템플릿 파일 읽기
   */
  static async readTemplate(configPath: string): Promise<string> {
    // .taskaction/templates/task-template.mustache 파일을 찾습니다
    const taskactionTemplatePath =
      await this.findTaskactionTemplatePath(configPath);

    if (taskactionTemplatePath) {
      try {
        return readFileSync(taskactionTemplatePath, 'utf8');
      } catch (error) {
        throw new Error(
          `템플릿 파일을 읽을 수 없습니다: ${taskactionTemplatePath}\n` +
            `오류: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    throw new Error(
      `.taskaction/templates/task-template.mustache 파일을 찾을 수 없습니다.\n` +
        `다음 위치에 파일이 있는지 확인하세요:\n` +
        `1. ./${configPath}/templates/task-template.mustache\n` +
        `먼저 'task-action init' 명령으로 프로젝트를 초기화해주세요.`
    );
  }

  /**
   * Task 파일 생성
   */
  static createTaskFile(
    taskId: string,
    content: string,
    configPath: string
  ): string {
    const formattedId = this.formatTaskId(taskId);
    const fileName = `task-${formattedId}.yaml`;
    const filePath = join(process.cwd(), configPath, fileName);

    if (existsSync(filePath)) {
      throw new Error(
        `Task 파일이 이미 존재합니다: ${fileName}\n` +
          '다른 Task ID를 사용하거나 기존 파일을 삭제하세요.'
      );
    }

    try {
      writeFileSync(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      throw new Error(
        `Task 파일을 생성할 수 없습니다: ${filePath}\n` +
          `오류: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * tasks.yaml 파일 읽기
   */
  static readTasksYaml(configPath: string): string {
    const tasksYamlPath = join(process.cwd(), configPath, 'tasks.yaml');

    if (!existsSync(tasksYamlPath)) {
      throw new Error(
        `tasks.yaml 파일을 찾을 수 없습니다: ${tasksYamlPath}\n` +
          '먼저 task-action init 명령으로 프로젝트를 초기화해주세요.'
      );
    }

    try {
      return readFileSync(tasksYamlPath, 'utf8');
    } catch (error) {
      throw new Error(
        `tasks.yaml 파일을 읽을 수 없습니다: ${tasksYamlPath}\n` +
          `오류: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * tasks.yaml 파일에 새로운 task 추가
   */
  static addTaskToTasksYaml(
    tasksYamlContent: string,
    taskId: string,
    status: string = 'todo'
  ): string {
    const formattedId = this.formatTaskId(taskId);

    // tasks: 섹션을 찾아서 새로운 task 추가
    const lines = tasksYamlContent.split('\n');
    const newTaskEntry = `  - id: ${formattedId}\n    status: ${status}`;

    // tasks: 섹션 찾기
    let tasksLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line !== undefined && line.trim() === 'tasks:') {
        tasksLineIndex = i;
        break;
      }
    }

    if (tasksLineIndex === -1) {
      throw new Error('tasks.yaml 파일에서 tasks: 섹션을 찾을 수 없습니다.');
    }

    // 기존 task가 있는지 확인
    const existingTaskPattern = new RegExp(
      `^\\s*-\\s+id:\\s+${formattedId}\\s*$`,
      'm'
    );
    if (existingTaskPattern.test(tasksYamlContent)) {
      throw new Error(
        `Task ID '${formattedId}'가 이미 tasks.yaml에 존재합니다.\n` +
          '다른 Task ID를 사용하거나 기존 항목을 삭제하세요.'
      );
    }

    // 마지막 task 항목 다음에 새로운 task 추가
    let insertIndex = lines.length;

    // tasks: 다음 줄부터 검사하여 마지막 task 항목 찾기
    for (let i = tasksLineIndex + 1; i < lines.length; i++) {
      const line = lines[i];

      // line이 undefined인 경우 건너뛰기
      if (line === undefined) {
        continue;
      }

      // 빈 줄이거나 주석이면 건너뛰기
      if (line.trim() === '' || line.trim().startsWith('#')) {
        continue;
      }

      // task 항목이 아닌 다른 섹션이 시작되면 그 전에 삽입
      if (line.match(/^[a-zA-Z]/)) {
        insertIndex = i;
        break;
      }

      // task 항목이면 계속 진행
      if (line.match(/^\s*-\s+id:/)) {
        continue;
      }

      // task 항목의 하위 속성이면 계속 진행
      if (line.match(/^\s+\w+:/)) {
        continue;
      }
    }

    // 새로운 task 항목 삽입
    lines.splice(insertIndex, 0, newTaskEntry);

    return lines.join('\n');
  }

  /**
   * tasks.yaml 파일 업데이트
   */
  static updateTasksYaml(
    configPath: string,
    taskId: string,
    status: string = 'todo'
  ): void {
    try {
      const tasksYamlContent = this.readTasksYaml(configPath);
      const updatedContent = this.addTaskToTasksYaml(
        tasksYamlContent,
        taskId,
        status
      );

      const tasksYamlPath = join(process.cwd(), configPath, 'tasks.yaml');
      writeFileSync(tasksYamlPath, updatedContent, 'utf8');
    } catch (error) {
      throw new Error(
        `tasks.yaml 파일 업데이트 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Add Task 핵심 로직
   */
  static async execute(input: AddTaskToolInput): Promise<AddTaskToolResponse> {
    const { taskId, configPath } = input;

    try {
      // 1. 템플릿 파일 읽기
      const template = await this.readTemplate(configPath);

      // 2. 변수 준비
      const formattedId = this.formatTaskId(taskId);
      const formattedName = this.formatTaskName(taskId);
      const variables = {
        id: formattedId,
        name: formattedName,
        description: `Task for ${formattedName}`,
        prompt: `Task: ${formattedName}`,
      };

      // 3. 템플릿 변수 치환
      const content = this.replaceTemplateVariables(template, variables);

      // 4. Task 파일 생성
      const filePath = this.createTaskFile(taskId, content, configPath);
      const fileName = `task-${formattedId}.yaml`;

      // 5. tasks.yaml 파일 업데이트
      let tasksYamlUpdated = false;
      try {
        this.updateTasksYaml(configPath, taskId, 'todo');
        tasksYamlUpdated = true;
      } catch (tasksYamlError) {
        // tasks.yaml 업데이트 실패는 경고로 처리하고 계속 진행
        console.warn(
          `⚠️  tasks.yaml 업데이트 실패: ${tasksYamlError instanceof Error ? tasksYamlError.message : String(tasksYamlError)}`
        );
      }

      const successMessage = tasksYamlUpdated
        ? `✅ Task 파일이 성공적으로 생성되었습니다: ${fileName}\n📝 tasks.yaml 파일도 업데이트되었습니다.`
        : `✅ Task 파일이 성공적으로 생성되었습니다: ${fileName}\n⚠️  tasks.yaml 파일 업데이트는 실패했습니다.`;

      return {
        success: true,
        message: successMessage,
        taskId: formattedId,
        fileName,
        filePath,
        tasksYamlUpdated,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `❌ Task 파일 생성 실패: ${errorMessage}`,
        taskId: this.formatTaskId(taskId),
        fileName: `task-${this.formatTaskId(taskId)}.yaml`,
        tasksYamlUpdated: false,
      };
    }
  }

  /**
   * 입력 유효성 검사 및 실행
   */
  static async executeWithValidation(
    args: unknown
  ): Promise<AddTaskToolResponse> {
    // Zod 스키마로 입력 검증
    const validatedInput = AddTaskToolSchema.parse(args);

    // 비즈니스 로직 실행
    return this.execute(validatedInput);
  }

  /**
   * CLI용 헬퍼 함수 - 직접 매개변수 전달
   */
  static async executeFromParams(
    taskId: string,
    configPath = '.taskaction'
  ): Promise<AddTaskToolResponse> {
    return this.execute({ taskId, configPath });
  }
}

/**
 * 간단한 함수형 인터페이스 (선택사항)
 */
export async function addTask(
  taskId: string,
  configPath = '.taskaction'
): Promise<AddTaskToolResponse> {
  return AddTaskTool.executeFromParams(taskId, configPath);
}

/**
 * MCP 도구용 헬퍼 함수
 */
export async function executeAddTaskTool(
  args: unknown
): Promise<AddTaskToolResponse> {
  return AddTaskTool.executeWithValidation(args);
}
