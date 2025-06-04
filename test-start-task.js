#!/usr/bin/env node

// 개선된 start task 기능 테스트
import { executeStartTaskTool } from './src/core/tools/start-task.js';

async function testStartTask() {
  console.log('🧪 Testing enhanced start task functionality...\n');

  try {
    const result = await executeStartTaskTool({
      taskId: 'init',
      projectRoot: '/Users/raiiz/madeinnook/workspace/task-action',
      configPath: '.taskaction',
      enhancedPrompt: false
    });

    console.log('✅ Test Result:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    console.log('Task ID:', result.taskId);
    console.log('\n📁 Files processed:');
    console.log(JSON.stringify(result.files, null, 2));
    
    console.log('\n📝 Combined Prompt (first 500 chars):');
    console.log(result.combinedPrompt?.substring(0, 500) + '...');

    // Enhanced prompt 테스트
    console.log('\n🚀 Testing with enhanced prompt...\n');
    
    const enhancedResult = await executeStartTaskTool({
      taskId: 'init',
      projectRoot: '/Users/raiiz/madeinnook/workspace/task-action',
      configPath: '.taskaction',
      enhancedPrompt: true
    });

    console.log('✅ Enhanced Test Result:');
    console.log('Success:', enhancedResult.success);
    console.log('Message:', enhancedResult.message);
    
    console.log('\n📝 Enhanced Combined Prompt (first 500 chars):');
    console.log(enhancedResult.combinedPrompt?.substring(0, 500) + '...');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testStartTask();
