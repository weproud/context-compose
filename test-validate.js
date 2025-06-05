import { ValidateTaskTool } from './dist/src/core/tools/validate-task.js';

async function testValidate() {
  try {
    console.log('🔍 Testing task validate function...');
    
    const result = await ValidateTaskTool.executeFromParams(
      'init',
      process.cwd(),
      '.taskaction'
    );
    
    console.log('\n📊 Result:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    console.log('Summary:', result.summary);
    
    console.log('\n📋 Validation Results:');
    result.validationResults.forEach(item => {
      const icon = item.status === 'pass' ? '✅' : item.status === 'fail' ? '❌' : '⚠️';
      console.log(`  ${icon} [${item.category}] ${item.item}: ${item.message}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testValidate();
