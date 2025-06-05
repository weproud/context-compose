/**
 * tools/test.ts
 * MCP tool for testing actions and notifications
 */
import { FastMCP } from 'fastmcp';
import { TestRunner } from '../test-runner.js';
import logger from '../logger.js';
import {
  TestToolSchema,
  type TestToolInput,
} from '../../../src/schemas/test.js';

/**
 * Register the test tool with the MCP server
 */
export function registerTestTool(server: FastMCP): void {
  server.addTool({
    name: 'test',
    description:
      'Test task-action actions and notifications in real environment',
    parameters: TestToolSchema,
    execute: async (input: TestToolInput) => {
      try {
        logger.info(`Test tool called with target: ${input.testTarget}`);

        // Validate input
        const validatedInput = TestToolSchema.parse(input);
        const { testTarget, projectRoot, dryRun, verbose } = validatedInput;

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
          logger.info(
            `Test configuration: ${JSON.stringify(testInfo, null, 2)}`
          );
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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Test tool error: ${errorMessage}`);

        const errorResponse = {
          success: false,
          message: `❌ Test tool execution failed: ${errorMessage}`,
          testTarget: input.testTarget,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };
        return JSON.stringify(errorResponse);
      }
    },
  });

  logger.info('Test tools registered successfully');
}
