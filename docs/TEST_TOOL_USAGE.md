# Task Action Test Tool 사용 가이드

## 개요

Task Action Test Tool은 AI 코딩 도구(Cursor, Windsurf 등)가 task-action의 개별 액션과 알림을 실제 환경에서 테스트할 수 있도록 하는 도구입니다.

## 🎯 주요 기능

### 1. **MCP 도구로 사용**

- `task-action-test`: 개별 액션/알림 테스트 실행
- `task-action-list-tests`: 사용 가능한 테스트 목록 조회
- `task-action-check-test-env`: 테스트 환경 설정 확인

### 2. **CLI 도구로 사용**

- `task-action test <target>`: 직접 테스트 실행
- `task-action test list`: 사용 가능한 테스트 목록
- `task-action test check`: 환경 설정 확인

## 🚀 사용 방법

### **MCP 도구 사용 (AI 코딩 도구에서)**

#### 1. 액션 테스트

```json
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "actions/create-branch"
  }
}
```

#### 2. 알림 테스트

```json
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "notify/slack-send-message"
  }
}
```

#### 3. 상세 옵션

```json
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "actions/git-commit",
    "verbose": true,
    "dryRun": false,
    "workingDirectory": "/path/to/project"
  }
}
```

### **CLI 사용**

#### 1. 기본 테스트 실행

```bash
# Git 브랜치 생성 테스트
task-action test actions/create-branch

# Slack 메시지 전송 테스트
task-action test notify/slack-send-message

# Discord 메시지 전송 테스트
task-action test notify/discord-send-message
```

#### 2. 옵션 사용

```bash
# 작업 디렉토리 지정
task-action test actions/git-commit --working-dir /path/to/project
```

#### 3. 도움말 명령

```bash
# 사용 가능한 테스트 목록
task-action test list

# 환경 설정 확인
task-action test check

# 특정 환경만 확인
task-action test check --type slack
```

## 📋 지원하는 테스트

### **Actions (액션)**

- `create-branch`: Git 브랜치 생성 테스트
- `git-commit`: Git 커밋 생성 테스트
- `git-push`: Git push 테스트 (dry-run)
- `create-pull-request`: Pull Request 생성 테스트
- `development`: 개발 워크플로우 테스트
- `task-done`: 작업 완료 처리 테스트

### **Notifications (알림)**

- `slack-send-message`: Slack 메시지 전송 테스트
- `discord-send-message`: Discord 메시지 전송 테스트

## 🔧 환경 설정

### **필수 환경변수**

```bash
# Slack 알림용
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Discord 알림용
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
```

### **선택적 환경변수**

```bash
# Slack 채널 지정 (기본값: #general)
export SLACK_CHANNEL="#development"

# GitHub 작업용
export GITHUB_TOKEN="your_github_token"
```

## 🎯 AI 코딩 도구 사용 예시

### **Cursor에서 사용**

```
사용자: "task-action test actions/create-branch 해줘"

AI가 실행할 MCP 도구:
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "actions/create-branch"
  }
}
```

### **Windsurf에서 사용**

```
사용자: "Slack으로 테스트 메시지 보내는 거 테스트해줘"

AI가 실행할 MCP 도구:
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "notify/slack-send-message",
    "verbose": true
  }
}
```

## 📊 테스트 결과 예시

### **성공 케이스**

```json
{
  "success": true,
  "message": "✅ Action 'Create Branch' executed successfully",
  "testTarget": "actions/create-branch",
  "executionTime": "1234ms",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "details": {
    "actionName": "Create Branch",
    "description": "Create a new Git branch with proper naming conventions",
    "output": "Created and cleaned up test branch: test-branch-1704110400000"
  }
}
```

### **실패 케이스**

```json
{
  "success": false,
  "message": "❌ Notification 'slack-send-message' failed",
  "testTarget": "notify/slack-send-message",
  "executionTime": "567ms",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "details": {
    "notifyName": "slack-send-message",
    "error": "SLACK_WEBHOOK_URL environment variable not set"
  }
}
```

## 🔍 문제 해결

### **일반적인 오류**

#### 1. 환경변수 누락

```
Error: SLACK_WEBHOOK_URL environment variable not set
```

**해결방법**: 필요한 환경변수를 설정하세요.

#### 2. Git 설정 오류

```
Error: Git not found or not configured
```

**해결방법**: Git을 설치하고 설정하세요.

#### 3. 권한 오류

```
Error: Permission denied
```

**해결방법**: 적절한 권한을 설정하거나 sudo를 사용하세요.

### **환경 확인 명령**

```bash
# 전체 환경 확인
task-action test check

# 특정 서비스만 확인
task-action test check --type slack
task-action test check --type discord
task-action test check --type git
```

## 🎉 실제 사용 시나리오

### **개발 워크플로우 테스트**

1. 새 기능 브랜치 생성 테스트
2. 코드 변경 후 커밋 테스트
3. Slack으로 진행 상황 알림 테스트
4. Pull Request 생성 테스트

```bash
# 1. 브랜치 생성 테스트
task-action test actions/create-branch

# 2. 커밋 테스트
task-action test actions/git-commit

# 3. Slack 알림 테스트
task-action test notify/slack-send-message

# 4. PR 생성 테스트
task-action test actions/create-pull-request
```

### **CI/CD 파이프라인 테스트**

```bash
# 배포 성공 알림 테스트
task-action test notify/slack-send-message --verbose

# Discord 팀 알림 테스트
task-action test notify/discord-send-message --verbose
```

이 도구를 통해 AI 코딩 도구가 task-action의 모든 기능을 안전하고 효율적으로 테스트할 수 있습니다.
