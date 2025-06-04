# Task Action MCP 서버 설정 가이드

이 가이드는 Task Action MCP 서버를 다양한 MCP 클라이언트에 등록하는 방법을 설명합니다.

## 📋 사전 준비

1. **프로젝트 빌드**

   ```bash
   npm install
   npm run build
   ```

2. **환경 변수 설정** (선택사항)
   ```bash
   export SLACK_WEBHOOK_URL="your-slack-webhook-url"
   export DISCORD_WEBHOOK_URL="your-discord-webhook-url"
   ```

## 🔧 MCP 클라이언트별 설정

### Claude Desktop

**설정 파일 위치:**

- **macOS**: `~/.claude/mcp_servers.json`
- **Windows**: `%APPDATA%\Claude\mcp_servers.json`
- **Linux**: `~/.config/claude/mcp_servers.json`

**설정 내용:**

```json
{
  "mcpServers": {
    "task-action": {
      "command": "node",
      "args": ["/absolute/path/to/task-action/mcp-server/server.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "your-slack-webhook-url-here",
        "DISCORD_WEBHOOK_URL": "your-discord-webhook-url-here"
      },
      "cwd": "/absolute/path/to/task-action"
    }
  }
}
```

### Cursor

**설정 파일 위치:**

- **macOS**: `~/.cursor/mcp_servers.json`
- **Windows**: `%APPDATA%\Cursor\mcp_servers.json`
- **Linux**: `~/.config/cursor/mcp_servers.json`

**설정 내용:**

```json
{
  "mcpServers": {
    "task-action": {
      "command": "node",
      "args": ["/absolute/path/to/task-action/mcp-server/server.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "your-slack-webhook-url-here",
        "DISCORD_WEBHOOK_URL": "your-discord-webhook-url-here"
      },
      "cwd": "/absolute/path/to/task-action"
    }
  }
}
```

## 🛠️ 개발 환경 설정

개발 중에는 TypeScript 파일을 직접 실행할 수 있습니다:

```json
{
  "mcpServers": {
    "task-action-dev": {
      "command": "npx",
      "args": ["tsx", "mcp-server/src/index.ts"],
      "env": {
        "NODE_ENV": "development",
        "SLACK_WEBHOOK_URL": "",
        "DISCORD_WEBHOOK_URL": ""
      },
      "cwd": "/absolute/path/to/task-action"
    }
  }
}
```

## 📁 제공된 설정 파일

프로젝트에는 다음 설정 파일들이 포함되어 있습니다:

- `mcp-config.json` - 일반적인 MCP 설정 (상대 경로)
- `claude-desktop-config.json` - Claude Desktop용 설정
- `cursor-mcp-config.json` - Cursor용 설정
- `mcp-config-dev.json` - 개발환경용 설정

## 🔍 설정 확인

### MCP Inspector로 테스트

```bash
# 빌드된 서버 테스트
npm run inspect:built

# TypeScript 소스 테스트
npm run inspect
```

### 사용 가능한 도구들

Task Action MCP 서버는 다음 도구들을 제공합니다:

1. **init** - Task Action 프로젝트 초기화 (assets → .taskaction 복사)
2. **send_message_slack** - Slack 메시지 전송
3. **send_message_discord** - Discord 메시지 전송

## 🚨 문제 해결

### 일반적인 문제들

1. **경로 문제**: 절대 경로를 사용하세요
2. **권한 문제**: Node.js 실행 권한을 확인하세요
3. **의존성 문제**: `npm install`을 실행했는지 확인하세요
4. **빌드 문제**: `npm run build`를 실행했는지 확인하세요

### 로그 확인

MCP 서버는 상세한 로그를 제공합니다. 문제가 발생하면 클라이언트의 로그를 확인하세요.

## 📞 지원

문제가 발생하면 GitHub Issues에 문의해주세요:
https://github.com/weproud/task-action/issues
