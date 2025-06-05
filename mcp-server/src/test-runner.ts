import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger.js';

const execAsync = promisify(exec);

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  executionTime: number;
  output?: string | undefined;
  error?: string | undefined;
}

export interface ActionConfig {
  version: number;
  kind: string;
  name: string;
  description: string;
  prompt: string;
  'enhanced-prompt'?: string;
}

export interface NotifyConfig {
  version: number;
  kind: string;
  name: string;
  description: string;
  webhook_url?: string;
  channel?: string;
  message_template?: string;
}

export class TestRunner {
  private workingDir: string;
  private taskactionDir: string;
  private assetsDir: string;
  private cleanup: boolean;
  private branchName: string | undefined;

  constructor(
    workingDir: string = process.cwd(),
    options: { cleanup?: boolean; branchName?: string } = {}
  ) {
    this.workingDir = workingDir;
    this.taskactionDir = join(workingDir, '.taskaction');
    this.assetsDir = join(workingDir, 'assets');
    this.cleanup = options.cleanup ?? true;
    this.branchName = options.branchName;
  }

  /**
   * 액션 파일 경로를 해결합니다
   * 우선순위: assets/actions -> .taskaction/actions
   */
  private resolveActionPath(actionName: string): string | null {
    // assets/actions 디렉토리에서 먼저 확인
    const assetsPath = join(this.assetsDir, 'actions', `${actionName}.yaml`);
    if (existsSync(assetsPath)) {
      return assetsPath;
    }

    // .taskaction/actions 디렉토리에서 확인
    const taskactionPath = join(
      this.taskactionDir,
      'actions',
      `${actionName}.yaml`
    );
    if (existsSync(taskactionPath)) {
      return taskactionPath;
    }

    return null;
  }

  /**
   * 알림 파일 경로를 해결합니다
   * 우선순위: assets/notify -> .taskaction/notify
   */
  private resolveNotifyPath(notifyName: string): string | null {
    // assets/notify 디렉토리에서 먼저 확인
    const assetsPath = join(this.assetsDir, 'notify', `${notifyName}.yaml`);
    if (existsSync(assetsPath)) {
      return assetsPath;
    }

    // .taskaction/notify 디렉토리에서 확인
    const taskactionPath = join(
      this.taskactionDir,
      'notify',
      `${notifyName}.yaml`
    );
    if (existsSync(taskactionPath)) {
      return taskactionPath;
    }

    return null;
  }

  /**
   * 테스트 대상을 실행합니다
   */
  async runTest(testTarget: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      logger.info(`Starting test for: ${testTarget}`);

      // Parse test target (actions/create-branch or notify/slack-send-message)
      const [type, name] = testTarget.split('/');

      if (!type || !name) {
        return {
          success: false,
          message:
            'Invalid test target format. Use: actions/<name> or notify/<name>',
          executionTime: Date.now() - startTime,
        };
      }

      let result: TestResult;

      switch (type.toLowerCase()) {
        case 'actions':
        case 'action':
          result = await this.testAction(name);
          break;
        case 'notify':
        case 'notification':
          result = await this.testNotification(name);
          break;
        default:
          result = {
            success: false,
            message: `Unknown test type: ${type}. Use 'actions' or 'notify'`,
            executionTime: Date.now() - startTime,
          };
      }

      result.executionTime = Date.now() - startTime;
      logger.info(
        `Test completed for ${testTarget}: ${result.success ? 'SUCCESS' : 'FAILED'}`
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Test failed for ${testTarget}: ${errorMessage}`);

      return {
        success: false,
        message: `Test execution failed: ${errorMessage}`,
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 액션을 테스트합니다
   */
  private async testAction(actionName: string): Promise<TestResult> {
    logger.info(`Testing action: ${actionName}`);

    // 액션 파일 경로 해결
    const actionPath = this.resolveActionPath(actionName);

    if (!actionPath) {
      return {
        success: false,
        message: `Action file not found: ${actionName}.yaml (searched in assets/actions and .taskaction/actions)`,
        executionTime: 0,
      };
    }

    try {
      // YAML 파일 로드
      const actionContent = readFileSync(actionPath, 'utf-8');
      const actionConfig: ActionConfig = parse(actionContent);

      logger.info(`Testing action: ${actionConfig.name}`);

      // Execute action based on action type
      const result = await this.executeAction(actionName, actionConfig);

      return {
        success: result.success,
        message: result.success
          ? `✅ Action '${actionConfig.name}' executed successfully`
          : `❌ Action '${actionConfig.name}' failed`,
        details: {
          actionName: actionConfig.name,
          description: actionConfig.description,
          output: result.output,
        },
        output: result.output,
        error: result.error,
        executionTime: 0, // Set by parent
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load or execute action: ${error}`,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      };
    }
  }

  /**
   * 알림을 테스트합니다
   */
  private async testNotification(notifyName: string): Promise<TestResult> {
    try {
      logger.info(`Testing notification: ${notifyName}`);

      // 알림 파일 경로 해결 (YAML 파일이 있는지 확인)
      const notifyPath = this.resolveNotifyPath(notifyName);

      if (!notifyPath) {
        return {
          success: false,
          message: `Notification file not found: ${notifyName}.yaml (searched in assets/notify and .taskaction/notify)`,
          executionTime: 0,
        };
      }

      // YAML 파일 로드하여 설정 확인
      try {
        const notifyContent = readFileSync(notifyPath, 'utf-8');
        const notifyConfig: NotifyConfig = parse(notifyContent);
        logger.info(`Testing notification: ${notifyConfig.name}`);
      } catch (parseError) {
        logger.warn(`Failed to parse notification config: ${parseError}`);
      }

      // 알림 타입에 따른 실제 실행
      const result = await this.executeNotification(notifyName);

      return {
        success: result.success,
        message: result.success
          ? `✅ Notification '${notifyName}' sent successfully`
          : `❌ Notification '${notifyName}' failed`,
        details: {
          notifyName,
          configPath: notifyPath,
          output: result.output,
        },
        output: result.output,
        error: result.error,
        executionTime: 0, // 상위에서 설정됨
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send notification: ${error}`,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      };
    }
  }

  /**
   * 실제 액션을 실행합니다
   */
  private async executeAction(
    actionName: string,
    config: ActionConfig
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    switch (actionName.toLowerCase()) {
      case 'create-branch':
        return this.executeCreateBranch();
      case 'git-commit':
        return this.executeGitCommit();
      case 'git-push':
        return this.executeGitPush();
      case 'create-pull-request':
        return this.executeCreatePullRequest();
      default:
        return this.executeGenericAction(actionName, config);
    }
  }

  /**
   * 실제 알림을 실행합니다
   */
  private async executeNotification(
    notifyName: string
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    switch (notifyName.toLowerCase()) {
      case 'slack-send-message':
      case 'send-message-slack':
        return this.executeSlackNotification();
      case 'discord-send-message':
      case 'send-message-discord':
        return this.executeDiscordNotification();
      default:
        return {
          success: false,
          error: `Unknown notification type: ${notifyName}`,
        };
    }
  }

  /**
   * Git 브랜치 생성 테스트
   */
  private async executeCreateBranch(): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    try {
      // 사용자 지정 브랜치 이름 또는 자동 생성
      const branchName = this.branchName || `test-branch-${Date.now()}`;

      // 브랜치 이름 유효성 검사
      if (!/^[a-zA-Z0-9/_-]+$/.test(branchName)) {
        return {
          success: false,
          error: `Invalid branch name: ${branchName}. Use only alphanumeric characters, hyphens, underscores, and forward slashes.`,
        };
      }

      const { stdout } = await execAsync(`git checkout -b ${branchName}`, {
        cwd: this.workingDir,
      });

      let outputMessage = `✅ Created branch: ${branchName}\n${stdout}`;

      // cleanup 옵션에 따라 정리 여부 결정
      if (this.cleanup) {
        try {
          await execAsync('git checkout -', { cwd: this.workingDir });
          await execAsync(`git branch -D ${branchName}`, {
            cwd: this.workingDir,
          });
          outputMessage = `🧪 Created and cleaned up test branch: ${branchName}\n${stdout}`;
        } catch (cleanupError) {
          logger.warn(`Failed to cleanup test branch: ${cleanupError}`);
          outputMessage += `\n⚠️ Warning: Failed to cleanup branch: ${cleanupError}`;
        }
      } else {
        outputMessage += `\n📌 Branch '${branchName}' has been created and is ready for use.`;
      }

      return {
        success: true,
        output: outputMessage,
      };
    } catch (error) {
      return {
        success: false,
        error: `Git branch creation failed: ${error}`,
      };
    }
  }

  /**
   * Git 커밋 테스트
   */
  private async executeGitCommit(): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    try {
      // 테스트용 파일 생성
      const testFile = join(this.workingDir, `test-commit-${Date.now()}.txt`);
      await execAsync(`echo "Test commit file" > ${testFile}`, {
        cwd: this.workingDir,
      });

      // Git add 및 commit
      await execAsync(`git add ${testFile}`, { cwd: this.workingDir });
      const { stdout } = await execAsync(
        `git commit -m "Test commit - will be reverted"`,
        { cwd: this.workingDir }
      );

      // 커밋 되돌리기
      await execAsync('git reset --hard HEAD~1', { cwd: this.workingDir });

      return {
        success: true,
        output: `Test commit created and reverted successfully\n${stdout}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Git commit test failed: ${error}`,
      };
    }
  }

  /**
   * Git push 테스트 (dry-run)
   */
  private async executeGitPush(): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    try {
      const { stdout } = await execAsync('git push --dry-run', {
        cwd: this.workingDir,
      });

      return {
        success: true,
        output: `Git push dry-run successful\n${stdout}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Git push test failed: ${error}`,
      };
    }
  }

  /**
   * Pull Request 생성 테스트 (시뮬레이션)
   */
  private async executeCreatePullRequest(): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    try {
      // GitHub CLI가 설치되어 있는지 확인
      await execAsync('gh --version');

      // PR 생성 시뮬레이션 (실제로는 생성하지 않음)
      const { stdout } = await execAsync('gh repo view --json url', {
        cwd: this.workingDir,
      });

      return {
        success: true,
        output: `Pull request creation test successful (simulation)\nRepository: ${stdout}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Pull request test failed: ${error}`,
      };
    }
  }

  /**
   * 일반적인 액션 실행 (시뮬레이션)
   */
  private async executeGenericAction(
    actionName: string,
    config: ActionConfig
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return {
      success: true,
      output: `Generic action '${actionName}' simulated successfully\nDescription: ${config.description}`,
    };
  }

  /**
   * Slack 알림 테스트
   */
  private async executeSlackNotification(): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return {
        success: false,
        error: 'SLACK_WEBHOOK_URL environment variable not set',
      };
    }

    try {
      const message = {
        text: `🧪 Test message from task-action at ${new Date().toISOString()}`,
        channel: process.env.SLACK_CHANNEL || '#general',
        username: 'Task-Action Test Bot',
        icon_emoji: ':test_tube:',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        return {
          success: true,
          output: `Slack message sent successfully to ${message.channel}`,
        };
      } else {
        return {
          success: false,
          error: `Slack API error: ${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Slack notification failed: ${error}`,
      };
    }
  }

  /**
   * Discord 알림 테스트
   */
  private async executeDiscordNotification(): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return {
        success: false,
        error: 'DISCORD_WEBHOOK_URL environment variable not set',
      };
    }

    try {
      const message = {
        content: `🧪 Test message from task-action at ${new Date().toISOString()}`,
        username: 'Task-Action Test Bot',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        return {
          success: true,
          output: 'Discord message sent successfully',
        };
      } else {
        return {
          success: false,
          error: `Discord API error: ${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Discord notification failed: ${error}`,
      };
    }
  }
}
