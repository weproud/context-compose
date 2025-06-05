import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { ActionTestRunner } from '../utils/action-test-runner';

describe('MCP Server Action Integration', () => {
  let mcpServer: ChildProcess;
  let testRunner: ActionTestRunner;
  const serverPort = 3001;
  const serverUrl = `http://localhost:${serverPort}`;

  beforeAll(async () => {
    // MCP 서버 시작
    await startMCPServer();
    testRunner = new ActionTestRunner();
  });

  afterAll(async () => {
    // MCP 서버 종료
    await stopMCPServer();
  });

  beforeEach(async () => {
    // 각 테스트 전에 서버 상태 확인
    await waitForServerReady();
  });

  describe('Server Lifecycle', () => {
    it('should start MCP server successfully', async () => {
      const isReady = await checkServerHealth();
      expect(isReady).toBe(true);
    });

    it('should respond to health check', async () => {
      const response = await fetch(`${serverUrl}/health`);
      expect(response.status).toBe(200);
    });

    it('should list available tools', async () => {
      const response = await fetch(`${serverUrl}/tools`);
      const tools = await response.json();
      
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('Action Execution via MCP', () => {
    it('should execute create-branch action through MCP', async () => {
      const actionRequest = {
        tool: 'task-action-run',
        parameters: {
          action: 'create-branch',
          context: {
            branchName: 'feature/test-integration',
            baseBranch: 'main',
          },
        },
      };

      const response = await callMCPTool(actionRequest);
      
      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
    });

    it('should execute slack message action through MCP', async () => {
      const actionRequest = {
        tool: 'task-action-run',
        parameters: {
          action: 'send-message-slack',
          context: {
            message: 'Integration test message',
            channel: '#test',
            webhookUrl: 'https://hooks.slack.com/test/webhook',
          },
        },
      };

      const response = await callMCPTool(actionRequest);
      
      expect(response.success).toBe(true);
    });

    it('should handle action errors gracefully', async () => {
      const actionRequest = {
        tool: 'task-action-run',
        parameters: {
          action: 'non-existent-action',
          context: {},
        },
      };

      const response = await callMCPTool(actionRequest);
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('AI Tool Simulation', () => {
    it('should simulate Cursor AI interaction', async () => {
      const aiRequest = {
        role: 'user',
        content: 'Create a new feature branch for user authentication',
        tools: ['task-action-run'],
      };

      const response = await simulateAIInteraction(aiRequest);
      
      expect(response).toBeDefined();
      expect(response.toolCalls).toBeDefined();
    });

    it('should simulate Windsurf AI interaction', async () => {
      const aiRequest = {
        role: 'user',
        content: 'Send a success message to Slack about deployment completion',
        tools: ['task-action-run'],
      };

      const response = await simulateAIInteraction(aiRequest);
      
      expect(response).toBeDefined();
    });

    it('should handle complex multi-step workflows', async () => {
      const workflow = [
        {
          action: 'create-branch',
          context: { branchName: 'feature/multi-step-test' },
        },
        {
          action: 'git-commit',
          context: { message: 'Initial commit for multi-step test' },
        },
        {
          action: 'send-message-slack',
          context: { message: 'Workflow completed successfully' },
        },
      ];

      const results = [];
      for (const step of workflow) {
        const response = await callMCPTool({
          tool: 'task-action-run',
          parameters: step,
        });
        results.push(response);
      }

      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle server disconnection', async () => {
      // 서버 일시 중단
      await stopMCPServer();
      
      const actionRequest = {
        tool: 'task-action-run',
        parameters: {
          action: 'create-branch',
          context: { branchName: 'test-disconnection' },
        },
      };

      // 연결 실패 확인
      await expect(callMCPTool(actionRequest)).rejects.toThrow();
      
      // 서버 재시작
      await startMCPServer();
      await waitForServerReady();
      
      // 복구 후 정상 동작 확인
      const response = await callMCPTool(actionRequest);
      expect(response.success).toBe(true);
    });

    it('should handle malformed requests', async () => {
      const malformedRequest = {
        tool: 'invalid-tool',
        parameters: 'invalid-parameters',
      };

      const response = await callMCPTool(malformedRequest);
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('invalid');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent action executions', async () => {
      const concurrentRequests = Array(5).fill(null).map((_, index) => ({
        tool: 'task-action-run',
        parameters: {
          action: 'create-branch',
          context: { branchName: `feature/concurrent-test-${index}` },
        },
      }));

      const promises = concurrentRequests.map(req => callMCPTool(req));
      const results = await Promise.all(promises);

      expect(results.every(r => r.success)).toBe(true);
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      const requests = Array(10).fill(null).map(() => ({
        tool: 'task-action-run',
        parameters: {
          action: 'send-message-slack',
          context: { message: 'Load test message' },
        },
      }));

      const promises = requests.map(req => callMCPTool(req));
      await Promise.all(promises);

      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(30000); // 30초 이내
    });
  });

  // Helper functions
  async function startMCPServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const serverPath = join(process.cwd(), 'mcp-server/server.ts');
      mcpServer = spawn('npx', ['tsx', serverPath], {
        env: { ...process.env, PORT: serverPort.toString() },
        stdio: 'pipe',
      });

      mcpServer.stdout?.on('data', (data) => {
        if (data.toString().includes('Server started')) {
          resolve();
        }
      });

      mcpServer.stderr?.on('data', (data) => {
        console.error('MCP Server Error:', data.toString());
      });

      mcpServer.on('error', reject);

      // 타임아웃 설정
      setTimeout(() => reject(new Error('Server start timeout')), 10000);
    });
  }

  async function stopMCPServer(): Promise<void> {
    if (mcpServer) {
      mcpServer.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async function waitForServerReady(): Promise<void> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${serverUrl}/health`);
        if (response.ok) return;
      } catch (error) {
        // 서버가 아직 준비되지 않음
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Server not ready after maximum attempts');
  }

  async function checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async function callMCPTool(request: any): Promise<any> {
    const response = await fetch(`${serverUrl}/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    return response.json();
  }

  async function simulateAIInteraction(request: any): Promise<any> {
    const response = await fetch(`${serverUrl}/ai/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    return response.json();
  }
});
