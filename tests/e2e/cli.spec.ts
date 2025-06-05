import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('MCP CLI Tool', () => {
  test('should show help message', async () => {
    const { stdout } = await execAsync('npm run cli -- --help');

    expect(stdout).toContain(
      'CLI for Model Context Protocol (MCP) server tools'
    );
    expect(stdout).toContain('add');
    expect(stdout).toContain('fetch-weather');
  });

  test('should execute add command correctly', async () => {
    const { stdout } = await execAsync('npm run cli -- add 5 3');

    expect(stdout.trim()).toBe('8');
  });

  test('should execute add command with verbose output', async () => {
    const { stdout } = await execAsync('npm run cli -- add 10 20 --verbose');

    expect(stdout).toContain('✅ Calculation completed:');
    expect(stdout).toContain('Input: 10, 20');
    expect(stdout).toContain('Result: 30');
    expect(stdout).toContain('Formula: 10 + 20 = 30');
  });

  test('should handle add command with invalid input', async () => {
    try {
      await execAsync('npm run cli -- add invalid 3');
    } catch (error) {
      expect(error.stderr || error.stdout).toContain(
        'Please enter valid numbers'
      );
    }
  });

  test('should execute fetch-weather command', async () => {
    const { stdout } = await execAsync('npm run cli -- fetch-weather Seoul');

    expect(stdout).toContain('Seoul');
    expect(stdout).toMatch(/\d+°C/); // Check temperature pattern
  });

  test('should execute fetch-weather command with fahrenheit', async () => {
    const { stdout } = await execAsync(
      'npm run cli -- fetch-weather Tokyo --units fahrenheit'
    );

    expect(stdout).toContain('Tokyo');
    expect(stdout).toMatch(/\d+°F/); // Check Fahrenheit temperature pattern
  });

  test('should execute fetch-weather command with verbose output', async () => {
    const { stdout } = await execAsync(
      'npm run cli -- fetch-weather "New York" --verbose'
    );

    expect(stdout).toContain('🌤️  Weather information retrieved:');
    expect(stdout).toContain('Location:');
    expect(stdout).toContain('Temperature:');
    expect(stdout).toContain('Status:');
    expect(stdout).toContain('Humidity:');
    expect(stdout).toContain('This is mock data');
  });

  test('should show examples', async () => {
    const { stdout } = await execAsync('npm run cli -- examples');

    expect(stdout).toContain('MCP CLI Tool Usage Examples');
    expect(stdout).toContain('Add Command Usage Examples:');
    expect(stdout).toContain('FetchWeather Command Usage Examples:');
  });

  test('should show specific command examples', async () => {
    const { stdout } = await execAsync('npm run cli -- examples --command add');

    expect(stdout).toContain('Add Command Usage Examples:');
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
