/**
 * CLI command for testing actions and notifications
 */
import { Command } from 'commander';
import { TestRunner } from '../../../mcp-server/src/test-runner.js';

export function createTestCommand(): Command {
  const testCommand = new Command('test');
  
  testCommand
    .description('Test task-action actions and notifications')
    .argument('<target>', 'Test target in format: actions/<name> or notify/<name>')
    .option('-d, --dry-run', 'Perform dry run without actual execution', false)
    .option('-v, --verbose', 'Enable verbose output', false)
    .option('-w, --working-dir <dir>', 'Working directory for test execution', process.cwd())
    .action(async (target: string, options) => {
      try {
        console.log('🧪 Task Action Test Runner');
        console.log(`Target: ${target}`);
        console.log(`Working Directory: ${options.workingDir}`);
        
        if (options.dryRun) {
          console.log('📋 Dry Run Mode - No actual execution');
          console.log(`Would test: ${target}`);
          return;
        }
        
        console.log('🚀 Starting test execution...');
        const startTime = Date.now();
        
        // Create test runner and run test
        const testRunner = new TestRunner(options.workingDir);
        const result = await testRunner.runTest(target);
        
        console.log(''); // Empty line
        
        if (result.success) {
          console.log('✅ TEST PASSED');
          console.log(result.message);
          
          if (result.output && options.verbose) {
            console.log('\n📤 Output:');
            console.log(result.output);
          }
        } else {
          console.log('❌ TEST FAILED');
          console.log(result.message);
          
          if (result.error) {
            console.log('\n🚨 Error:');
            console.log(result.error);
          }
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`\n⏱️  Execution Time: ${totalTime}ms`);
        
        if (options.verbose && result.details) {
          console.log('\n📊 Details:');
          console.log(JSON.stringify(result.details, null, 2));
        }
        
        process.exit(result.success ? 0 : 1);
      } catch (error) {
        console.error('💥 Test execution failed:');
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // List available tests
  testCommand
    .command('list')
    .description('List available tests')
    .action(async () => {
      console.log('📋 Available Tests\n');
      
      console.log('🎯 Actions:');
      console.log('  • create-branch - Create a new Git branch');
      console.log('  • git-commit - Create a Git commit');
      console.log('  • git-push - Push changes to remote repository');
      console.log('  • create-pull-request - Create a pull request');
      console.log('');
      
      console.log('📢 Notifications:');
      console.log('  • slack-send-message - Send message to Slack');
      console.log('  • discord-send-message - Send message to Discord');
      console.log('');

      console.log('💡 Usage Examples:');
      console.log('  task-action test actions/create-branch');
      console.log('  task-action test notify/slack-send-message');
      console.log('  task-action test actions/git-commit --verbose');
      console.log('  task-action test notify/discord-send-message --dry-run');
      
      console.log('\n🔧 Environment Variables:');
      console.log('  Required:');
      console.log('    SLACK_WEBHOOK_URL - For Slack notifications');
      console.log('    DISCORD_WEBHOOK_URL - For Discord notifications');
      console.log('  Optional:');
      console.log('    SLACK_CHANNEL - Slack channel (defaults to #general)');
      console.log('    GITHUB_TOKEN - For GitHub operations');
    });

  return testCommand;
}
