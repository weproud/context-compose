/**
 * tools/test.ts
 * MCP tools for testing actions and notifications
 */
import { FastMCP } from 'fastmcp';
import { TestRunner } from '../test-runner.js';
import logger from '../logger.js';
import {
  TestActionToolSchema,
  TestNotifyToolSchema,
  type TestActionToolInput,
  type TestNotifyToolInput,
} from '../../../src/schemas/test.js';

/**
 * 공통 테스트 실행 로직
 */
async function executeTest(
  input: TestActionToolInput | TestNotifyToolInput,
  toolName: string
): Promise<string> {
  try {
    logger.info(`${toolName} tool called with target: ${input.testTarget}`);

    const { testTarget, projectRoot, dryRun, verbose, cleanup, branchName } =
      input;

    // testTarget 형식 정규화
    let normalizedTarget = testTarget;

    if (toolName === 'test-action') {
      // test-action의 경우: 단순한 이름이면 actions/ prefix 추가
      if (!testTarget.includes('/')) {
        normalizedTarget = `actions/${testTarget}`;
      } else if (!testTarget.startsWith('actions/')) {
        throw new Error(
          'test-action tool requires testTarget to be in format: <action-name> or actions/<action-name>'
        );
      }
    }

    if (toolName === 'test-notify') {
      // test-notify의 경우: 단순한 이름이면 notify/ prefix 추가
      if (!testTarget.includes('/')) {
        normalizedTarget = `notify/${testTarget}`;
      } else if (!testTarget.startsWith('notify/')) {
        throw new Error(
          'test-notify tool requires testTarget to be in format: <notify-name> or notify/<notify-name>'
        );
      }
    }

    // Create test runner with projectRoot and options
    const testRunnerOptions: { cleanup?: boolean; branchName?: string } = {};
    if (cleanup !== undefined) testRunnerOptions.cleanup = cleanup;
    if (branchName !== undefined) testRunnerOptions.branchName = branchName;

    const testRunner = new TestRunner(projectRoot, testRunnerOptions);

    // Show test information
    const testInfo = {
      originalTarget: testTarget,
      normalizedTarget,
      projectRoot,
      dryRun,
      verbose,
      cleanup,
      branchName,
      timestamp: new Date().toISOString(),
    };

    if (verbose) {
      logger.info(`Test configuration: ${JSON.stringify(testInfo, null, 2)}`);
    }

    // Execute test
    if (dryRun) {
      const dryRunResponse = {
        success: true,
        message: `🧪 Dry run for test target: ${testTarget} (normalized: ${normalizedTarget})`,
        details: {
          ...testInfo,
          note: 'This was a dry run - no actual execution performed',
        },
      };
      return JSON.stringify(dryRunResponse);
    }

    // Run actual test
    const result = await testRunner.runTest(normalizedTarget);

    // Format response
    const response = {
      success: result.success,
      message: result.message,
      originalTarget: testTarget,
      normalizedTarget,
      executionTime: `${result.executionTime}ms`,
      timestamp: new Date().toISOString(),
      details: result.details,
    };

    if (result.output) {
      response.details = {
        ...response.details,
        output: result.output,
      };
    }

    if (result.error) {
      response.details = {
        ...response.details,
        error: result.error,
      };
    }

    if (verbose) {
      response.details = {
        ...response.details,
        testConfiguration: testInfo,
      };
    }

    logger.info(
      `Test completed: ${result.success ? 'SUCCESS' : 'FAILED'} for ${testTarget} (normalized: ${normalizedTarget})`
    );

    return JSON.stringify(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`${toolName} tool error: ${errorMessage}`);

    const errorResponse = {
      success: false,
      message: `❌ ${toolName} tool execution failed: ${errorMessage}`,
      testTarget: input.testTarget,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(errorResponse);
  }
}

/**
 * Register the test-action tool with the MCP server
 */
export function registerTestActionTool(server: FastMCP): void {
  server.addTool({
    name: 'test-action',
    description:
      'Test task-action actions in real environment (e.g., test-action create-branch or test-action actions/create-branch)',
    parameters: TestActionToolSchema,
    execute: async (input: TestActionToolInput) => {
      return executeTest(input, 'test-action');
    },
  });

  logger.info('Test Action tool registered successfully');
}

/**
 * Register the test-notify tool with the MCP server
 */
export function registerTestNotifyTool(server: FastMCP): void {
  server.addTool({
    name: 'test-notify',
    description:
      'Test task-action notifications in real environment (e.g., test-notify slack-send-message or test-notify notify/slack-send-message)',
    parameters: TestNotifyToolSchema,
    execute: async (input: TestNotifyToolInput) => {
      return executeTest(input, 'test-notify');
    },
  });

  logger.info('Test Notify tool registered successfully');
}
