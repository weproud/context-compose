#!/usr/bin/env node

/**
 * New test-action feature testing script
 */

import { TestRunner } from './mcp-server/src/test-runner.js';
import { existsSync } from 'fs';
import { join } from 'path';

async function testNewFeature() {
  console.log('🧪 Testing new test-action and test-notify features\n');

  const testRunner = new TestRunner();

  // Test cases
  const testCases = [
    {
      name: 'test-action with simple name (should find in assets/actions)',
      target: 'actions/create-branch',
      description: 'Testing create-branch action from assets directory',
    },
    {
      name: 'test-notify with simple name (should find in assets/notify)',
      target: 'notify/slack-send-message',
      description: 'Testing slack notification from assets directory',
    },
    {
      name: 'test-notify discord (should find in assets/notify)',
      target: 'notify/discord-send-message',
      description: 'Testing discord notification from assets directory',
    },
  ];

  // Check file existence
  console.log('📁 Checking file existence:');
  const assetsDir = join(process.cwd(), 'assets');

  const filesToCheck = [
    'assets/actions/create-branch.yaml',
    'assets/actions/git-commit.yaml',
    'assets/notify/slack-send-message.yaml',
    'assets/notify/discord-send-message.yaml',
  ];

  filesToCheck.forEach(file => {
    const exists = existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });

  console.log('\n🔍 Testing path resolution:');

  // Test TestRunner's resolveActionPath and resolveNotifyPath methods
  // These methods are private so cannot be tested directly, but tested indirectly through runTest

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`   Target: ${testCase.target}`);
    console.log(`   Description: ${testCase.description}`);

    try {
      // Test in dry-run mode (does not actually execute)
      const result = await testRunner.runTest(testCase.target);

      if (result.success) {
        console.log(`   ✅ SUCCESS: ${result.message}`);
      } else {
        console.log(`   ❌ FAILED: ${result.message}`);
      }

      if (result.details) {
        console.log(
          `   📝 Details: ${JSON.stringify(result.details, null, 2)}`
        );
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }
  }

  console.log('\n🎯 Test completed!');
}

// Execute script
testNewFeature().catch(console.error);
