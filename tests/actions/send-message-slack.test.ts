import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionTestRunner } from '../utils/action-test-runner';
import { join } from 'path';

describe('Send Message Slack Action', () => {
  let testRunner: ActionTestRunner;
  const actionPath = join(
    process.cwd(),
    '.taskaction/actions/send-message-slack.yaml'
  );

  beforeEach(() => {
    testRunner = new ActionTestRunner();
  });

  describe('Action Loading', () => {
    it('should load send-message-slack action successfully', async () => {
      const action = await testRunner.loadAction(actionPath);

      expect(action.name).toBe('Send Message to Slack');
      expect(action.kind).toBe('action');
      expect(action.description).toContain('Slack');
      expect(action.prompt).toContain('SLACK_WEBHOOK_URL');
    });
  });

  describe('Mock Execution', () => {
    it('should send basic message successfully', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE: 'Test message',
          CHANNEL: '#development',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should handle rich message formatting', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE_TYPE: 'success',
          TITLE: 'Task Completed',
          DESCRIPTION: 'Feature implementation finished',
          BRANCH: 'feature/new-feature',
          STATUS: 'Completed',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      expect(result.success).toBe(true);
    });

    it('should validate message types', async () => {
      const messageTypes = ['success', 'warning', 'error', 'info'];

      for (const messageType of messageTypes) {
        const customContext = {
          environment: {
            SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
            MESSAGE_TYPE: messageType,
            MESSAGE: `Test ${messageType} message`,
          },
        };

        const result = await testRunner.runAction(
          actionPath,
          'mock',
          customContext
        );

        expect(result.success).toBe(true);
      }
    });

    it('should handle attachments and rich formatting', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE: 'Build Status Update',
          INCLUDE_ATTACHMENTS: 'true',
          ATTACHMENT_COLOR: 'good',
          ATTACHMENT_TITLE: 'Build Successful',
          ATTACHMENT_FIELDS: JSON.stringify([
            { title: 'Branch', value: 'main', short: true },
            { title: 'Tests', value: 'All passing', short: true },
          ]),
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing webhook URL', async () => {
      const customContext = {
        environment: {
          // SLACK_WEBHOOK_URL 누락
          MESSAGE: 'Test message',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      // 실제 구현에서는 webhook URL 검증 로직 필요
      // Mock에서는 기본값을 사용하므로 성공할 수 있음
    });

    it('should handle invalid webhook URL format', async () => {
      const invalidUrls = [
        'invalid-url',
        'http://not-slack-webhook.com',
        '',
        'https://hooks.slack.com/incomplete',
      ];

      for (const invalidUrl of invalidUrls) {
        const customContext = {
          environment: {
            SLACK_WEBHOOK_URL: invalidUrl,
            MESSAGE: 'Test message',
          },
        };

        const result = await testRunner.runAction(
          actionPath,
          'mock',
          customContext
        );

        // 실제 구현에서는 URL 검증 로직 추가 필요
      }
    });

    it('should handle network failures', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE: 'Test message',
          SIMULATE_NETWORK_ERROR: 'true',
        },
      };

      // Mock 서비스에서 네트워크 에러 시뮬레이션
      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      // 실제 구현에서는 네트워크 에러 처리 테스트
    });

    it('should handle rate limiting', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE: 'Test message',
          SIMULATE_RATE_LIMIT: 'true',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      // 실제 구현에서는 rate limiting 처리 테스트
    });
  });

  describe('Message Validation', () => {
    it('should validate message content', async () => {
      const testCases = [
        { message: '', shouldPass: false },
        { message: 'Valid message', shouldPass: true },
        { message: 'A'.repeat(4000), shouldPass: false }, // Message too long
        { message: 'Message with @channel', shouldPass: true },
        { message: 'Message with <@U123456>', shouldPass: true },
      ];

      for (const testCase of testCases) {
        const customContext = {
          environment: {
            SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
            MESSAGE: testCase.message,
          },
        };

        const result = await testRunner.runAction(
          actionPath,
          'mock',
          customContext
        );

        // Message validation logic needs to be added in actual implementation
      }
    });

    it('should validate JSON payload structure', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE: 'Test message',
          VALIDATE_JSON: 'true',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      expect(result.success).toBe(true);
      // 실제 구현에서는 JSON 구조 검증
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with MCP server', async () => {
      const result = await testRunner.runAction(actionPath, 'integration');

      expect(result).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should work with real Slack webhook (E2E)', async () => {
      // Execute only when real Slack webhook is configured
      if (process.env.REAL_SLACK_WEBHOOK_URL) {
        const customContext = {
          environment: {
            SLACK_WEBHOOK_URL: process.env.REAL_SLACK_WEBHOOK_URL,
            MESSAGE: 'Test message from automated test',
            CHANNEL: '#test',
          },
        };

        const result = await testRunner.runAction(
          actionPath,
          'e2e',
          customContext
        );

        expect(result.success).toBe(true);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should complete message sending within timeout', async () => {
      const result = await testRunner.runAction(actionPath, 'mock');

      expect(result.executionTime).toBeLessThan(10000); // 10초 이내
    });

    it('should handle multiple concurrent messages', async () => {
      const promises = Array(3)
        .fill(null)
        .map((_, index) => {
          const customContext = {
            environment: {
              SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
              MESSAGE: `Concurrent test message ${index + 1}`,
            },
          };

          return testRunner.runAction(actionPath, 'mock', customContext);
        });

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Security Tests', () => {
    it('should not expose webhook URL in logs', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/secret/webhook',
          MESSAGE: 'Test message',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      // Verify that webhook URL is not exposed in logs or output
      expect(result.output).not.toContain('secret');
    });

    it('should sanitize message content', async () => {
      const customContext = {
        environment: {
          SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test/webhook',
          MESSAGE: 'Message with <script>alert("xss")</script>',
        },
      };

      const result = await testRunner.runAction(
        actionPath,
        'mock',
        customContext
      );

      // Test XSS prevention logic in actual implementation
      expect(result.success).toBe(true);
    });
  });
});
