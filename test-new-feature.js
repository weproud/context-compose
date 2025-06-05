#!/usr/bin/env node

/**
 * 새로운 test-action 기능 테스트 스크립트
 */

import { TestRunner } from './mcp-server/src/test-runner.js';
import { existsSync } from 'fs';
import { join } from 'path';

async function testNewFeature() {
  console.log('🧪 Testing new test-action and test-notify features\n');
  
  const testRunner = new TestRunner();
  
  // 테스트 케이스들
  const testCases = [
    {
      name: 'test-action with simple name (should find in assets/actions)',
      target: 'actions/create-branch',
      description: 'Testing create-branch action from assets directory'
    },
    {
      name: 'test-notify with simple name (should find in assets/notify)',
      target: 'notify/slack-send-message',
      description: 'Testing slack notification from assets directory'
    },
    {
      name: 'test-notify discord (should find in assets/notify)',
      target: 'notify/discord-send-message',
      description: 'Testing discord notification from assets directory'
    }
  ];

  // 파일 존재 확인
  console.log('📁 Checking file existence:');
  const assetsDir = join(process.cwd(), 'assets');
  
  const filesToCheck = [
    'assets/actions/create-branch.yaml',
    'assets/actions/git-commit.yaml',
    'assets/notify/slack-send-message.yaml',
    'assets/notify/discord-send-message.yaml'
  ];
  
  filesToCheck.forEach(file => {
    const exists = existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });
  
  console.log('\n🔍 Testing path resolution:');
  
  // TestRunner의 resolveActionPath와 resolveNotifyPath 메서드 테스트
  // 이 메서드들은 private이므로 직접 테스트할 수 없지만, runTest를 통해 간접적으로 테스트
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`   Target: ${testCase.target}`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // dry-run 모드로 테스트 (실제 실행하지 않음)
      const result = await testRunner.runTest(testCase.target);
      
      if (result.success) {
        console.log(`   ✅ SUCCESS: ${result.message}`);
      } else {
        console.log(`   ❌ FAILED: ${result.message}`);
      }
      
      if (result.details) {
        console.log(`   📝 Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Test completed!');
}

// 스크립트 실행
testNewFeature().catch(console.error);
