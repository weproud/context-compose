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
  ListTestsToolSchema,
  type ListTestsToolInput,
  CheckTestEnvToolSchema,
  type CheckTestEnvToolInput,
} from '../../../src/schemas/test.js';

/**
 * Register the test tool with the MCP server
 */
export function registerTestTool(server: FastMCP): void {
  server.addTool({
    name: 'task-action-test',
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

  // Additional tool for listing available tests
  server.addTool({
    name: 'task-action-list-tests',
    description: 'List available actions and notifications that can be tested',
    parameters: ListTestsToolSchema,
    execute: async (input: ListTestsToolInput) => {
      try {
        const { type, projectRoot } = input;

        const availableTests = {
          actions: [
            'create-branch - Create a new Git branch',
            'git-commit - Create a Git commit',
            'git-push - Push changes to remote repository',
            'create-pull-request - Create a pull request',
            'development - Development workflow actions',
            'task-done - Mark task as completed',
          ],
          notify: [
            'slack-send-message - Send message to Slack',
            'discord-send-message - Send message to Discord',
          ],
        };

        let result: any = {
          message: '📋 Available tests:',
          timestamp: new Date().toISOString(),
          projectRoot,
        };

        switch (type) {
          case 'actions':
            result.actions = availableTests.actions;
            result.usage =
              'Use: task-action-test with testTarget "actions/<n>"';
            break;
          case 'notify':
            result.notifications = availableTests.notify;
            result.usage = 'Use: task-action-test with testTarget "notify/<n>"';
            break;
          case 'all':
          default:
            result.actions = availableTests.actions;
            result.notifications = availableTests.notify;
            result.usage =
              'Use: task-action-test with testTarget "actions/<n>" or "notify/<n>"';
            break;
        }

        result.examples = [
          'task-action-test { "testTarget": "actions/create-branch", "projectRoot": "/path/to/project" }',
          'task-action-test { "testTarget": "notify/slack-send-message", "projectRoot": "/path/to/project" }',
          'task-action-test { "testTarget": "actions/git-commit", "projectRoot": "/path/to/project", "verbose": true }',
          'task-action-test { "testTarget": "notify/discord-send-message", "projectRoot": "/path/to/project", "dryRun": true }',
        ];

        result.environmentVariables = {
          required: [
            'SLACK_WEBHOOK_URL - Required for Slack notifications',
            'DISCORD_WEBHOOK_URL - Required for Discord notifications',
          ],
          optional: [
            'SLACK_CHANNEL - Slack channel (defaults to #general)',
            'GITHUB_TOKEN - Required for GitHub operations',
          ],
        };

        return JSON.stringify(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`List tests tool error: ${errorMessage}`);

        const errorResponse = {
          success: false,
          message: `❌ Failed to list available tests: ${errorMessage}`,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };
        return JSON.stringify(errorResponse);
      }
    },
  });

  // Tool for checking test environment
  server.addTool({
    name: 'task-action-check-test-env',
    description: 'Check if test environment is properly configured',
    parameters: CheckTestEnvToolSchema,
    execute: async (input: CheckTestEnvToolInput) => {
      try {
        const { checkType, projectRoot } = input;

        const checks = {
          git: {
            name: 'Git Configuration',
            status: 'unknown',
            details: '',
          },
          slack: {
            name: 'Slack Configuration',
            status: 'unknown',
            details: '',
          },
          discord: {
            name: 'Discord Configuration',
            status: 'unknown',
            details: '',
          },
        };

        // Check Git
        if (checkType === 'all' || checkType === 'git') {
          try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            await execAsync('git --version');
            checks.git.status = 'ok';
            checks.git.details = 'Git is available';
          } catch (error) {
            checks.git.status = 'error';
            checks.git.details = 'Git not found or not configured';
          }
        }

        // Check Slack
        if (checkType === 'all' || checkType === 'slack') {
          const slackWebhook = process.env.SLACK_WEBHOOK_URL;
          if (slackWebhook) {
            checks.slack.status = 'ok';
            checks.slack.details = 'SLACK_WEBHOOK_URL is configured';
          } else {
            checks.slack.status = 'warning';
            checks.slack.details =
              'SLACK_WEBHOOK_URL environment variable not set';
          }
        }

        // Check Discord
        if (checkType === 'all' || checkType === 'discord') {
          const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
          if (discordWebhook) {
            checks.discord.status = 'ok';
            checks.discord.details = 'DISCORD_WEBHOOK_URL is configured';
          } else {
            checks.discord.status = 'warning';
            checks.discord.details =
              'DISCORD_WEBHOOK_URL environment variable not set';
          }
        }

        const hasWarnings = Object.values(checks).some(
          check => check.status === 'warning'
        );
        const hasErrors = Object.values(checks).some(
          check => check.status === 'error'
        );

        let overallStatus = 'ok';
        let message = '✅ Test environment is properly configured';

        if (hasErrors) {
          overallStatus = 'error';
          message = '❌ Test environment has configuration errors';
        } else if (hasWarnings) {
          overallStatus = 'warning';
          message = '⚠️ Test environment has warnings';
        }

        const result = {
          success: !hasErrors,
          message,
          overallStatus,
          projectRoot,
          checks: Object.fromEntries(
            Object.entries(checks).filter(
              ([key]) => checkType === 'all' || key === checkType
            )
          ),
          recommendations: [
            hasWarnings &&
              'Set missing environment variables for full functionality',
            hasErrors && 'Install and configure missing tools',
          ].filter(Boolean),
          timestamp: new Date().toISOString(),
        };
        return JSON.stringify(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Environment check tool error: ${errorMessage}`);

        const errorResponse = {
          success: false,
          message: `❌ Environment check failed: ${errorMessage}`,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };
        return JSON.stringify(errorResponse);
      }
    },
  });

  logger.info('Test tools registered successfully');
}
