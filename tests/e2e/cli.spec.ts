import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('MCP CLI Tool', () => {
  test('should show help message', async () => {
    const { stdout } = await execAsync('npm run cli -- --help');
    
    expect(stdout).toContain('Model Context Protocol (MCP) 서버 도구들을 위한 CLI');
    expect(stdout).toContain('add');
    expect(stdout).toContain('fetch-weather');
  });
  
  test('should execute add command correctly', async () => {
    const { stdout } = await execAsync('npm run cli -- add 5 3');
    
    expect(stdout.trim()).toBe('8');
  });
  
  test('should execute add command with verbose output', async () => {
    const { stdout } = await execAsync('npm run cli -- add 10 20 --verbose');
    
    expect(stdout).toContain('✅ 계산 완료:');
    expect(stdout).toContain('입력: 10, 20');
    expect(stdout).toContain('결과: 30');
    expect(stdout).toContain('계산식: 10 + 20 = 30');
  });
  
  test('should handle add command with invalid input', async () => {
    try {
      await execAsync('npm run cli -- add invalid 3');
    } catch (error) {
      expect(error.stderr || error.stdout).toContain('유효한 숫자를 입력해주세요');
    }
  });
  
  test('should execute fetch-weather command', async () => {
    const { stdout } = await execAsync('npm run cli -- fetch-weather Seoul');
    
    expect(stdout).toContain('Seoul');
    expect(stdout).toMatch(/\d+°C/); // 온도 패턴 확인
  });
  
  test('should execute fetch-weather command with fahrenheit', async () => {
    const { stdout } = await execAsync('npm run cli -- fetch-weather Tokyo --units fahrenheit');
    
    expect(stdout).toContain('Tokyo');
    expect(stdout).toMatch(/\d+°F/); // 화씨 온도 패턴 확인
  });
  
  test('should execute fetch-weather command with verbose output', async () => {
    const { stdout } = await execAsync('npm run cli -- fetch-weather "New York" --verbose');
    
    expect(stdout).toContain('🌤️  날씨 정보 조회 완료:');
    expect(stdout).toContain('위치:');
    expect(stdout).toContain('온도:');
    expect(stdout).toContain('상태:');
    expect(stdout).toContain('습도:');
    expect(stdout).toContain('모의 데이터입니다');
  });
  
  test('should show examples', async () => {
    const { stdout } = await execAsync('npm run cli -- examples');
    
    expect(stdout).toContain('MCP CLI 도구 사용 예시');
    expect(stdout).toContain('Add 명령 사용 예시:');
    expect(stdout).toContain('FetchWeather 명령 사용 예시:');
  });
  
  test('should show specific command examples', async () => {
    const { stdout } = await execAsync('npm run cli -- examples --command add');
    
    expect(stdout).toContain('Add 명령 사용 예시:');
    expect(stdout).toContain('mcp-tool add 5 3');
  });
  
  test('should handle invalid command gracefully', async () => {
    try {
      await execAsync('npm run cli -- invalid-command');
    } catch (error) {
      expect(error.stderr || error.stdout).toContain('error');
    }
  });
});
