#!/usr/bin/env npx tsx

import { ActionTestRunner } from '../tests/utils/action-test-runner';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { program } from 'commander';

interface TestOptions {
  mode: 'mock' | 'integration' | 'e2e';
  action?: string;
  verbose: boolean;
  output: 'console' | 'json' | 'html';
  timeout: number;
}

class ActionTestSuite {
  private testRunner: ActionTestRunner;
  private actionsDir: string;

  constructor() {
    this.testRunner = new ActionTestRunner();
    this.actionsDir = join(process.cwd(), '.taskaction/actions');
  }

  /**
   * Find and return all action files
   */
  private findActionFiles(): string[] {
    try {
      const files = readdirSync(this.actionsDir);
      return files
        .filter(file => extname(file) === '.yaml' || extname(file) === '.yml')
        .map(file => join(this.actionsDir, file));
    } catch (error) {
      console.error(`Failed to read actions directory: ${this.actionsDir}`);
      return [];
    }
  }

  /**
   * Execute single action test
   */
  async testSingleAction(actionPath: string, options: TestOptions) {
    console.log(`\n🧪 Testing action: ${actionPath}`);
    console.log(`📋 Mode: ${options.mode}`);

    const startTime = Date.now();

    try {
      const result = await this.testRunner.runAction(actionPath, options.mode);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`✅ PASS (${duration}ms)`);
        if (options.verbose && result.output) {
          console.log(`📤 Output: ${result.output}`);
        }
      } else {
        console.log(`❌ FAIL (${duration}ms)`);
        if (result.error) {
          console.log(`🚨 Error: ${result.error}`);
        }
      }

      if (options.verbose && result.validationResults.length > 0) {
        console.log(`📊 Validation Results:`);
        result.validationResults.forEach(validation => {
          const icon =
            validation.type === 'success'
              ? '✅'
              : validation.type === 'warning'
                ? '⚠️'
                : '❌';
          console.log(`   ${icon} ${validation.message}`);
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`💥 ERROR (${duration}ms): ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: duration,
        validationResults: [],
      };
    }
  }

  /**
   * Execute all action tests
   */
  async testAllActions(options: TestOptions) {
    const actionFiles = this.findActionFiles();

    if (actionFiles.length === 0) {
      console.log('❌ No action files found in .taskaction/actions directory');
      return;
    }

    console.log(`🚀 Running tests for ${actionFiles.length} actions`);
    console.log(`📋 Mode: ${options.mode}`);
    console.log(`⏱️  Timeout: ${options.timeout}ms`);

    const results = new Map();
    let passCount = 0;
    let failCount = 0;

    for (const actionFile of actionFiles) {
      const result = await this.testSingleAction(actionFile, options);
      results.set(actionFile, result);

      if (result.success) {
        passCount++;
      } else {
        failCount++;
      }
    }

    // Test summary
    console.log(`\n📊 Test Summary:`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(
      `📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`
    );

    // Failed test details
    if (failCount > 0) {
      console.log(`\n🚨 Failed Tests:`);
      for (const [actionFile, result] of results) {
        if (!result.success) {
          console.log(
            `   ❌ ${actionFile}: ${result.error || 'Unknown error'}`
          );
        }
      }
    }

    // Save results based on output format
    await this.saveResults(results, options);

    return results;
  }

  /**
   * Execute tests for specific action type
   */
  async testActionsByType(actionType: string, options: TestOptions) {
    const actionFiles = this.findActionFiles();
    const filteredFiles = actionFiles.filter(file =>
      file.toLowerCase().includes(actionType.toLowerCase())
    );

    if (filteredFiles.length === 0) {
      console.log(`❌ No actions found for type: ${actionType}`);
      return;
    }

    console.log(
      `🎯 Testing ${filteredFiles.length} actions of type: ${actionType}`
    );

    const results = new Map();
    for (const actionFile of filteredFiles) {
      const result = await this.testSingleAction(actionFile, options);
      results.set(actionFile, result);
    }

    return results;
  }

  /**
   * Save test results in specified format
   */
  private async saveResults(results: Map<string, any>, options: TestOptions) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    switch (options.output) {
      case 'json':
        const jsonResults = Object.fromEntries(results);
        const jsonOutput = JSON.stringify(jsonResults, null, 2);
        const jsonFile = `test-results-${timestamp}.json`;

        await import('fs').then(fs => fs.writeFileSync(jsonFile, jsonOutput));
        console.log(`📄 JSON results saved to: ${jsonFile}`);
        break;

      case 'html':
        const htmlContent = this.generateHtmlReport(results);
        const htmlFile = `test-results-${timestamp}.html`;

        await import('fs').then(fs => fs.writeFileSync(htmlFile, htmlContent));
        console.log(`🌐 HTML report saved to: ${htmlFile}`);
        break;

      case 'console':
      default:
        // Console output already completed
        break;
    }
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(results: Map<string, any>): string {
    const passCount = Array.from(results.values()).filter(
      r => r.success
    ).length;
    const failCount = Array.from(results.values()).filter(
      r => !r.success
    ).length;
    const successRate = ((passCount / (passCount + failCount)) * 100).toFixed(
      1
    );

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Task Action Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .pass { background: #d4edda; border-left: 4px solid #28a745; }
        .fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .details { margin-top: 10px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <h1>Task Action Test Results</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tests:</strong> ${passCount + failCount}</p>
        <p><strong>Passed:</strong> ${passCount}</p>
        <p><strong>Failed:</strong> ${failCount}</p>
        <p><strong>Success Rate:</strong> ${successRate}%</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <h2>Test Results</h2>
    ${Array.from(results.entries())
      .map(
        ([actionFile, result]) => `
        <div class="test-result ${result.success ? 'pass' : 'fail'}">
            <h3>${actionFile.split('/').pop()}</h3>
            <p><strong>Status:</strong> ${result.success ? '✅ PASS' : '❌ FAIL'}</p>
            <p><strong>Execution Time:</strong> ${result.executionTime}ms</p>
            ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
            ${result.output ? `<div class="details"><strong>Output:</strong><br>${result.output}</div>` : ''}
        </div>
    `
      )
      .join('')}
</body>
</html>`;
  }
}

// CLI configuration
program
  .name('test-actions')
  .description('Test individual task-action YAML files')
  .version('1.0.0');

program
  .command('all')
  .description('Test all actions')
  .option('-m, --mode <mode>', 'Test mode: mock, integration, e2e', 'mock')
  .option('-v, --verbose', 'Verbose output', false)
  .option(
    '-o, --output <format>',
    'Output format: console, json, html',
    'console'
  )
  .option('-t, --timeout <ms>', 'Timeout in milliseconds', '30000')
  .action(async (options: TestOptions) => {
    const testSuite = new ActionTestSuite();
    await testSuite.testAllActions(options);
  });

program
  .command('single <action>')
  .description('Test a single action')
  .option('-m, --mode <mode>', 'Test mode: mock, integration, e2e', 'mock')
  .option('-v, --verbose', 'Verbose output', false)
  .option(
    '-o, --output <format>',
    'Output format: console, json, html',
    'console'
  )
  .option('-t, --timeout <ms>', 'Timeout in milliseconds', '30000')
  .action(async (action: string, options: TestOptions) => {
    const testSuite = new ActionTestSuite();
    const actionPath = join(
      process.cwd(),
      '.taskaction/actions',
      `${action}.yaml`
    );
    await testSuite.testSingleAction(actionPath, options);
  });

program
  .command('type <actionType>')
  .description('Test actions by type (e.g., git, slack, discord)')
  .option('-m, --mode <mode>', 'Test mode: mock, integration, e2e', 'mock')
  .option('-v, --verbose', 'Verbose output', false)
  .option(
    '-o, --output <format>',
    'Output format: console, json, html',
    'console'
  )
  .option('-t, --timeout <ms>', 'Timeout in milliseconds', '30000')
  .action(async (actionType: string, options: TestOptions) => {
    const testSuite = new ActionTestSuite();
    await testSuite.testActionsByType(actionType, options);
  });

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
