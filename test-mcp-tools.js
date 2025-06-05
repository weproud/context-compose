#!/usr/bin/env node

/**
 * Simple test script for MCP tools
 */

import { TestRunner } from './mcp-server/src/test-runner.js';

async function testMCPTools() {
  console.log('🧪 Testing MCP Tools\n');
  
  const testRunner = new TestRunner();
  
  // Test cases
  const testCases = [
    'actions/create-branch',
    'notify/slack-send-message',
    'notify/discord-send-message',
    'actions/git-commit',
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await testRunner.runTest(testCase);
      
      if (result.success) {
        console.log('✅ PASSED');
        console.log(`📝 ${result.message}`);
        if (result.output) {
          console.log(`📤 Output: ${result.output.substring(0, 100)}...`);
        }
      } else {
        console.log('❌ FAILED');
        console.log(`📝 ${result.message}`);
        if (result.error) {
          console.log(`🚨 Error: ${result.error}`);
        }
      }
      
      console.log(`⏱️  Time: ${result.executionTime}ms`);
      
    } catch (error) {
      console.log('💥 ERROR');
      console.log(`🚨 ${error.message}`);
    }
  }
  
  console.log('\n🎉 Test completed!');
}

// Run tests
testMCPTools().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
