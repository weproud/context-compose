import { Command } from 'commander';
import { GreetingTool } from '../../core/tools/greeting.js';

/**
 * Greeting 명령 생성
 */
export function createGreetingCommand(): Command {
  const greetingCommand = new Command('greeting');

  greetingCommand
    .description('Greeting 파일을 생성합니다')
    .argument('<name>', 'Greeting 이름')
    .option('-f, --force', '기존 파일이 있어도 덮어쓰기', false)
    .option('-c, --config-path <path>', '설정 디렉토리 경로', '.hellomcp')
    .action(
      async (name: string, options: { force: boolean; configPath: string }) => {
        try {
          console.log(`🎉 Greeting "${name}" 생성 중...`);

          const result = await GreetingTool.executeFromParams(
            name,
            options.force,
            options.configPath
          );

          if (result.success) {
            console.log(result.message);
          } else {
            console.error(result.message);
            process.exit(1);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`❌ Greeting 생성 중 오류 발생: ${errorMessage}`);
          process.exit(1);
        }
      }
    );

  // 도움말 개선
  greetingCommand.on('--help', () => {
    console.log('');
    console.log('사용 예시:');
    console.log('  $ task-action greeting hi');
    console.log('  $ task-action greeting "Hello World"');
    console.log('  $ task-action greeting "안녕하세요!" --force');
    console.log('  $ task-action greeting welcome --config-path ./config');
    console.log('');
    console.log('설명:');
    console.log(
      '  이 명령은 .hellomcp 디렉토리에 hello-<name>.yaml 파일을 생성합니다.'
    );
    console.log('  공백과 특수 문자는 자동으로 dash(-)로 치환됩니다.');
    console.log('  예시:');
    console.log('    "Hello World" → hello-hello-world.yaml');
    console.log('    "안녕하세요!" → hello-안녕하세요.yaml');
    console.log('    "test@123" → hello-test-123.yaml');
  });

  return greetingCommand;
}

/**
 * Greeting 명령 사용 예시 표시
 */
export function showGreetingExamples(): void {
  console.log('🎉 Greeting 명령 사용 예시:');
  console.log('');
  console.log('기본 사용법:');
  console.log('  $ task-action greeting hi');
  console.log('  → .hellomcp/hello-hi.yaml 파일 생성');
  console.log('');
  console.log('공백이 포함된 이름:');
  console.log('  $ task-action greeting "Hello World"');
  console.log('  → .hellomcp/hello-hello-world.yaml 파일 생성');
  console.log('');
  console.log('특수 문자가 포함된 이름:');
  console.log('  $ task-action greeting "test@123"');
  console.log('  → .hellomcp/hello-test-123.yaml 파일 생성');
  console.log('');
  console.log('한글 이름:');
  console.log('  $ task-action greeting "안녕하세요!"');
  console.log('  → .hellomcp/hello-안녕하세요.yaml 파일 생성');
  console.log('');
  console.log('기존 파일 덮어쓰기:');
  console.log('  $ task-action greeting hi --force');
  console.log('  → 기존 hello-hi.yaml 파일이 있어도 덮어쓰기');
  console.log('');
  console.log('다른 디렉토리에 생성:');
  console.log('  $ task-action greeting hi --config-path ./my-config');
  console.log('  → ./my-config/hello-hi.yaml 파일 생성');
}
