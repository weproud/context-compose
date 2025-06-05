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

    const { testTarget, projectRoot, dryRun, verbose } = input;

    // 도구별 testTarget 형식 검증
    if (toolName === 'test-action' && !testTarget.startsWith('actions/')) {
      throw new Error(
        'test-action tool requires testTarget to start with "actions/"'
      );
    }
    if (toolName === 'test-notify' && !testTarget.startsWith('notify/')) {
      throw new Error(
        'test-notify tool requires testTarget to start with "notify/"'
      );
    }

    // Create test runner with projectRoot
    const testRunner = new TestRunner(projectRoot);

    // Show test information
    const testInfo = {
      target: testTarget,
      projectRoot,
      dryRun,
      verbose,
      timestamp: new Date().toISOString(),
    };

    if (verbose) {
      logger.info(`Test configuration: ${JSON.stringify(testInfo, null, 2)}`);
    }

    // Execute test
    if (dryRun) {
      const dryRunResponse = {
        success: true,
        message: `🧪 Dry run for test target: ${testTarget}`,
        details: {
          ...testInfo,
          note: 'This was a dry run - no actual execution performed',
        },
      };
      return JSON.stringify(dryRunResponse);
    }

    // Run actual test
    const result = await testRunner.runTest(testTarget);

    // Format response
    const response = {
      success: result.success,
      message: result.message,
      testTarget,
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
      `Test completed: ${result.success ? 'SUCCESS' : 'FAILED'} for ${testTarget}`
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
      'Test task-action actions in real environment (e.g., test-action actions/create-branch)',
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
      'Test task-action notifications in real environment (e.g., test-notify notify/slack-send-message)',
    parameters: TestNotifyToolSchema,
    execute: async (input: TestNotifyToolInput) => {
      return executeTest(input, 'test-notify');
    },
  });

  logger.info('Test Notify tool registered successfully');
}
