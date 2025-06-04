#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const projectRoot = resolve(__dirname, '..');

/**
 * MCP 설정 파일을 현재 프로젝트 경로에 맞게 업데이트
 */
function updateMcpConfigs() {
  const absolutePath = resolve(projectRoot);
  
  const configs = [
    'claude-desktop-config.json',
    'cursor-mcp-config.json'
  ];

  configs.forEach(configFile => {
    try {
      const configPath = join(projectRoot, configFile);
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      
      // 절대 경로로 업데이트
      if (config.mcpServers && config.mcpServers['task-action']) {
        config.mcpServers['task-action'].args[0] = join(absolutePath, 'mcp-server/server.js');
        config.mcpServers['task-action'].cwd = absolutePath;
      }
      
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ ${configFile} 업데이트 완료: ${absolutePath}`);
    } catch (error) {
      console.error(`❌ ${configFile} 업데이트 실패:`, error.message);
    }
  });
}

/**
 * 사용법 안내
 */
function showUsage() {
  console.log(`
🔧 Task Action MCP 설정 도구

현재 프로젝트 경로: ${resolve(projectRoot)}

📁 생성된 설정 파일들:
- mcp-config.json (일반용)
- claude-desktop-config.json (Claude Desktop용)
- cursor-mcp-config.json (Cursor용)
- mcp-config-dev.json (개발용)

📖 자세한 설정 방법은 MCP-SETUP.md를 참고하세요.

🚀 다음 단계:
1. npm run build (프로젝트 빌드)
2. 해당 클라이언트의 설정 파일에 내용 복사
3. 클라이언트 재시작

💡 유용한 명령어들:
- npm run mcp:config:claude  # Claude Desktop 설정 보기
- npm run mcp:config:cursor  # Cursor 설정 보기
- npm run inspect:built      # MCP Inspector로 테스트
`);
}

// 메인 실행
updateMcpConfigs();
showUsage();
