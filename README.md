세상이 너무 빠르게 발전하고 있다.

Task Master를 사용해보고 개발 생산성의 향상을 경험했고,

여기에 Github Action 패턴을 활용하면 각자의 환경에 맞는 다양한 task 요구사항들을 커스터마이즈해서 task를 관리할 수 있을거라 생각했다.

마침 augmentcode에서 beta test중인 Remote Agent를 사용하고 있었는데 Task Action과 궁합이 잘 맞을거라 생각해서 개발을 시작한다.

# Task Action MCP

작업 자동화 및 워크플로우 관리를 위한 포괄적인 MCP 서버 및 CLI 도구입니다. Node.js, TypeScript, FastMCP로 구축되었습니다.

## 📋 개요

이 프로젝트는 작업 관리, 워크플로우 자동화, 메시징 통합을 위한 완전한 Model Context Protocol (MCP) 서버와 CLI 도구를 제공합니다. MCP 서버는 대형 언어 모델(LLM)이 외부 시스템과 상호작용할 수 있도록 도구, 리소스, 프롬프트를 노출하며, CLI 도구는 서버 기능을 직접 명령줄에서 사용할 수 있게 합니다.

### 주요 기능

- **FastMCP 기반 서버**: Node.js와 TypeScript로 구축된 확장 가능한 MCP 서버
- **작업 관리**: 프로젝트 초기화, 작업 추가, 작업 시작, 상태 관리
- **워크플로우 자동화**: Assets 기반 구성 시스템으로 워크플로우, 규칙, MCP 도구 관리
- **메시징 통합**: Slack, Discord 메시징 지원
- **CLI 인터페이스**: Commander.js 기반 CLI로 MCP 서버 기능 미러링
- **타입 안전성**: Zod 스키마 검증을 통한 완전한 TypeScript 지원
- **테스트**: Vitest와 Playwright를 통한 포괄적인 테스트
- **디버깅**: 개발을 위한 내장 MCP Inspector 지원
- **단일 패키지**: 다중 진입점을 가진 통합 패키지

## 🛠️ 기술 스택

### 핵심 기술

- **런타임**: Node.js with FastMCP
- **언어**: TypeScript
- **패키지 매니저**: npm/pnpm
- **MCP 프레임워크**: FastMCP (TypeScript)
- **스키마 검증**: Zod
- **CLI 프레임워크**: Commander.js
- **린팅 & 포매팅**: ESLint, Prettier
- **테스트**: Vitest (unit/integration), Playwright (E2E)
- **전송**: Stdio (local), HTTP SSE (remote)

### 의존성

- **핵심**:
  - `fastmcp` - TypeScript MCP 프레임워크
  - `zod` - 스키마 검증
  - `commander` - CLI 프레임워크
  - `fs-extra` - 파일 시스템 유틸리티
  - `yaml` - YAML 파싱
  - `mustache` - 템플릿 엔진
  - `inquirer` - 대화형 CLI
- **개발**:
  - `typescript`
  - `@types/node`
  - `vitest`
  - `@playwright/test`
  - `eslint`
  - `prettier`

## 📁 프로젝트 구조

```
task-action/
├── assets/                      # 구성 파일 및 템플릿
│   ├── actions/                 # 액션 정의 (YAML)
│   │   ├── create-branch.yaml   # Git 브랜치 생성
│   │   ├── create-pull-request.yaml # PR 생성
│   │   ├── development.yaml     # 개발 관련 액션
│   │   ├── git-commit.yaml      # Git 커밋
│   │   ├── git-push.yaml        # Git 푸시
│   │   ├── send-message.yaml    # 메시지 전송
│   │   ├── task-done.yaml       # 작업 완료
│   │   └── test.yaml            # 테스트 실행
│   ├── mcps/                    # MCP 도구 정의
│   │   ├── context7.yaml        # Context7 MCP
│   │   ├── playwright.yaml      # Playwright MCP
│   │   └── sequential-thinking.yaml # Sequential Thinking MCP
│   ├── notify/                  # 알림 설정
│   │   ├── discord-send-message.yaml # Discord 알림
│   │   └── slack-send-message.yaml   # Slack 알림
│   ├── rules/                   # 개발 규칙
│   │   ├── development.yaml     # 개발 규칙
│   │   ├── refactoring.yaml     # 리팩토링 규칙
│   │   └── the-must-follow.yaml # 필수 준수 규칙
│   ├── workflows/               # 워크플로우 정의
│   │   └── feature.yaml         # 기능 개발 워크플로우
│   ├── templates/               # Mustache 템플릿
│   │   └── feature-task.mustache # 기능 작업 템플릿
│   ├── task-init.yaml           # 초기화 작업 정의
│   ├── task-test.yaml           # 테스트 작업 정의
│   ├── tasks.yaml               # 작업 목록
│   └── vars.yaml                # 변수 정의
├── mcp-server/                  # MCP 서버 (FastMCP 기반)
│   ├── src/                     # MCP 서버 소스 코드
│   │   ├── tools/               # 도구 정의
│   │   │   ├── init.ts          # 프로젝트 초기화 도구
│   │   │   ├── add-task.ts      # 작업 추가 도구
│   │   │   ├── start-task.ts    # 작업 시작 도구
│   │   │   ├── task-status.ts   # 작업 상태 도구
│   │   │   ├── test.ts          # 테스트 도구
│   │   │   ├── slack.ts         # Slack 메시징 도구
│   │   │   ├── discord.ts       # Discord 메시징 도구
│   │   │   └── index.ts         # 도구 등록
│   │   ├── index.ts             # MCP 서버 메인 클래스
│   │   ├── logger.ts            # 로깅 유틸리티
│   │   └── test-runner.ts       # 테스트 실행기
│   └── server.ts                # MCP 서버 진입점
├── src/                         # 공유 소스 코드
│   ├── schemas/                 # 도구별 스키마 정의
│   │   ├── init.ts              # 초기화 도구 스키마
│   │   ├── add-task.ts          # 작업 추가 스키마
│   │   ├── start-task.ts        # 작업 시작 스키마
│   │   ├── task-status.ts       # 작업 상태 스키마
│   │   ├── test.ts              # 테스트 스키마
│   │   ├── slack.ts             # Slack 스키마
│   │   ├── discord.ts           # Discord 스키마
│   │   └── index.ts             # 스키마 내보내기
│   ├── core/                    # 공유 유틸리티 및 비즈니스 로직
│   │   ├── tools/               # 공통 비즈니스 로직
│   │   ├── env.ts               # 환경 변수 관리
│   │   └── fetch.ts             # HTTP 요청 유틸리티
│   ├── cli/                     # CLI 로직
│   │   ├── commands/            # CLI 명령 핸들러
│   │   └── index.ts             # CLI 진입점
│   └── types/                   # 공통 TypeScript 타입 정의
├── tests/                       # 테스트 코드
│   ├── unit/                    # Vitest 단위 테스트
│   ├── integration/             # 통합 테스트
│   ├── e2e/                     # Playwright E2E 테스트
│   ├── actions/                 # 액션 테스트
│   └── utils/                   # 테스트 유틸리티
├── bin/                         # 실행 파일
│   └── task-action-cli.js       # CLI 실행 파일
├── scripts/                     # 스크립트
│   ├── inspect.sh               # MCP Inspector 스크립트
│   └── test-actions.ts          # 액션 테스트 스크립트
├── docs/                        # 문서
├── tsconfig.json                # TypeScript 구성
├── package.json                 # 패키지 구성
├── vitest.config.ts             # Vitest 구성
├── playwright.config.ts         # Playwright 구성
└── README.md                    # 프로젝트 문서
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 pnpm (권장)

### 설치

```bash
# 저장소 클론
git clone https://github.com/weproud/task-action.git
cd task-action

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build
```

### 빠른 시작

#### 1. MCP 서버 실행

```bash
# 개발 모드 (TypeScript)
npm run dev:server

# 프로덕션 모드 (JavaScript)
npm run start:server
```

#### 2. CLI 도구 사용

```bash
# 프로젝트 초기화
npm run task-action init

# 작업 시작
npm run task-action start-task <task-id>

# 작업 추가
npm run task-action add-task

# 작업 상태 확인
npm run task-action task-status

# Slack 메시지 전송 (SLACK_WEBHOOK_URL 필요)
npm run task-action slack send-message "Hello, World!"

# Discord 메시지 전송 (DISCORD_WEBHOOK_URL 필요)
npm run task-action discord send-message "Hello, Discord!"

# 테스트 실행
npm run task-action test
```

#### 3. MCP Inspector로 테스트

```bash
# 서버 검사
npm run inspect
```

## 🏗️ 아키텍처

### Assets 기반 구성 시스템

이 프로젝트는 **Assets 기반 구성 시스템**을 사용하여 워크플로우, 규칙, 액션, MCP 도구를 관리합니다.

#### Assets 구조

```
assets/
├── actions/            # 실행 가능한 액션들
├── workflows/          # 워크플로우 정의
├── rules/              # 개발 규칙 및 가이드라인
├── mcps/               # MCP 도구 설정
├── notify/             # 알림 설정
├── templates/          # Mustache 템플릿
├── tasks.yaml          # 작업 목록
└── vars.yaml           # 전역 변수
```

#### 공유 비즈니스 로직

이 프로젝트는 **DRY (Don't Repeat Yourself)** 원칙을 따라 CLI와 MCP 서버 구현 간에 동일한 비즈니스 로직을 공유합니다.

#### 장점

- **중복 없음**: CLI와 MCP 서버에서 동일한 로직 재사용
- **유지보수성**: 비즈니스 로직을 한 곳에서만 변경
- **테스트 가능성**: 핵심 로직을 독립적으로 테스트
- **일관성**: CLI와 MCP 서버 동작이 항상 일치
- **인터페이스 분리**: 비즈니스 로직과 인터페이스 로직 분리
- **구성 기반**: YAML 파일을 통한 유연한 구성 관리

## 🔍 MCP Inspector 사용법

MCP Inspector는 웹 UI를 통해 MCP 서버를 테스트하고 디버깅하는 공식 도구입니다.

### MCP Inspector 실행

#### 방법 1: npm 스크립트 (권장)

```bash
# TypeScript 소스 파일로 실행
npm run inspect

# 빌드된 JavaScript 파일로 실행
npm run build
npm run inspect:built
```

#### 방법 2: 직접 FastMCP 사용

```bash
# TypeScript 파일로 실행
npx fastmcp inspect mcp-server/server.ts

# JavaScript 파일로 실행 (빌드 후)
npx fastmcp inspect dist/mcp-server/server.js
```

### MCP Inspector 사용 방법

1. **서버 시작**: 위 명령 중 하나를 실행하면 웹 브라우저가 자동으로 열립니다
2. **도구 테스트**: `init`, `start_task`, `slack_send_message` 등의 도구를 웹 UI에서 직접 테스트
3. **리소스 확인**: `logs://application` 같은 사용 가능한 리소스 탐색
4. **실시간 디버깅**: 서버 로그와 요청/응답을 실시간으로 모니터링

### MCP Inspector 기능

- **🛠️ 도구 테스트**: 웹 UI에서 각 MCP 도구를 직접 실행
- **📊 리소스 탐색**: 서버에서 제공하는 리소스 탐색
- **🔍 실시간 로그**: 서버 작동 상태 모니터링
- **📝 스키마 검증**: 도구 매개변수 스키마 확인
- **🚀 빠른 프로토타이핑**: 개발 중 새로운 도구를 즉시 테스트

### 테스트 시나리오 예시

#### Init 도구 테스트

1. MCP Inspector 실행
2. "Tools" 탭에서 "init" 도구 선택
3. 매개변수 입력: `{"configPath": ".taskaction", "force": false}`
4. "Execute" 버튼 클릭
5. 결과 확인: 프로젝트 초기화 결과 JSON

#### 작업 시작 도구 테스트

1. "start_task" 도구 선택
2. 매개변수 입력: `{"taskId": "init", "projectRoot": "/path/to/project"}`
3. 실행하고 결과 확인

#### 메시징 도구 테스트

1. "slack_send_message" 도구 선택
2. 매개변수 입력: `{"message": "Hello from MCP!"}`
3. 실행하고 결과 확인 (환경에 SLACK_WEBHOOK_URL 필요)

## 🖥️ CLI 사용법

### 사용 가능한 명령어

CLI는 MCP 서버 도구와 동일한 기능을 제공하여 직접 명령줄에서 사용할 수 있습니다.

#### 방법 1: npm 스크립트 (권장)

```bash
# 프로젝트 초기화
npm run task-action init

# 작업 시작
npm run task-action start-task <task-id>

# 작업 추가
npm run task-action add-task

# 작업 상태 확인
npm run task-action task-status

# 테스트 실행
npm run task-action test

# Slack 메시지 전송
npm run task-action slack send-message "Hello, World!"

# Discord 메시지 전송
npm run task-action discord send-message "Hello, Discord!"

# 도움말 표시
npm run task-action --help
```

#### 방법 2: 직접 실행

```bash
# tsx를 사용하여 직접 실행
npx tsx src/cli/index.ts init
npx tsx src/cli/index.ts start-task <task-id>
npx tsx src/cli/index.ts test
```

#### 방법 3: 전역 설치 (선택사항)

```bash
# 프로젝트를 전역으로 링크
npm link

# 어디서나 사용
task-action init
task-action start-task <task-id>
task-action --help
```

### 명령어 예시

#### Init 명령어

```bash
# 기본 사용법
npm run task-action init
# 결과: .taskaction 디렉토리와 구성 파일들 생성

# 강제 덮어쓰기
npm run task-action init --force
# 결과: 기존 파일들을 덮어씀
```

#### 작업 시작 명령어

```bash
# 간단한 프롬프트로 작업 시작 (기본값)
npm run task-action start-task init
# 결과: 작업, 워크플로우, 규칙, MCP 프롬프트를 간단한 형식으로 결합

# 향상된 프롬프트로 작업 시작 (상세 가이드라인)
npm run task-action start-task init --enhanced-prompt
# 결과: 포괄적인 가이드를 위한 상세한 프롬프트 향상 콘텐츠 사용

# 사용자 정의 구성 경로로 작업 시작
npm run task-action start-task my-feature-task --config-path .taskaction

# 향상된 프롬프트와 사용자 정의 구성 (단축 형식)
npm run task-action start-task complex-task -e -c .taskaction
```

#### 작업 관리 명령어

```bash
# 작업 추가
npm run task-action add-task

# 작업 상태 확인
npm run task-action task-status

# 테스트 실행
npm run task-action test
```

#### 메시징 명령어

```bash
# Slack 메시지 전송 (SLACK_WEBHOOK_URL 환경 변수 필요)
SLACK_WEBHOOK_URL="your-webhook-url" npm run task-action slack send-message "Hello from CLI!"

# Discord 메시지 전송 (DISCORD_WEBHOOK_URL 환경 변수 필요)
DISCORD_WEBHOOK_URL="your-webhook-url" npm run task-action discord send-message "Hello from CLI!"
```

## 🔧 MCP 서버 사용법

### MCP 클라이언트와의 통합

#### Claude Desktop 통합

Claude Desktop MCP 설정에 다음 구성을 추가하세요:

**macOS**: `~/.claude/mcp_servers.json`
**Windows**: `%APPDATA%\Claude\mcp_servers.json`
**Linux**: `~/.config/claude/mcp_servers.json`

```json
{
  "mcpServers": {
    "task-action": {
      "command": "node",
      "args": ["path/to/task-action/mcp-server/server.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "your-slack-webhook-url",
        "DISCORD_WEBHOOK_URL": "your-discord-webhook-url"
      }
    }
  }
}
```

#### Cursor 통합

Cursor MCP 설정에 추가하세요:

**macOS**: `~/.cursor/mcp_servers.json`
**Windows**: `%APPDATA%\Cursor\mcp_servers.json`
**Linux**: `~/.config/cursor/mcp_servers.json`

```json
{
  "mcpServers": {
    "task-action": {
      "command": "node",
      "args": ["path/to/task-action/mcp-server/server.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "your-slack-webhook-url",
        "DISCORD_WEBHOOK_URL": "your-discord-webhook-url"
      }
    }
  }
}
```

### 사용 가능한 도구

MCP 서버는 다음 도구들을 제공합니다:

- **`init`**: Task Action 프로젝트 초기화 (`.taskaction` 디렉토리와 구성 파일들 생성)

  - `configPath`: 구성 디렉토리 경로 (기본값: `.taskaction`)
  - `force`: 기존 파일 강제 덮어쓰기 (기본값: `false`)

- **`start_task`**: 작업, 워크플로우, 규칙, MCP 파일의 프롬프트를 결합하여 작업 시작

  - `taskId`: 시작할 작업 식별자
  - `projectRoot`: 프로젝트 루트 디렉토리 (절대 경로)
  - `configPath`: 구성 디렉토리 경로 (기본값: `.taskaction`)
  - `enhancedPrompt`: 간단한 프롬프트 대신 상세한 향상된 프롬프트 사용 (기본값: `false`)

- **`add_task`**: 새로운 작업 추가

  - `projectRoot`: 프로젝트 루트 디렉토리 (절대 경로)
  - `configPath`: 구성 디렉토리 경로 (기본값: `.taskaction`)

- **`task_status`**: 작업 상태 확인 및 관리

  - `projectRoot`: 프로젝트 루트 디렉토리 (절대 경로)
  - `configPath`: 구성 디렉토리 경로 (기본값: `.taskaction`)

- **`test`**: 테스트 실행 및 검증

  - `projectRoot`: 프로젝트 루트 디렉토리 (절대 경로)
  - `configPath`: 구성 디렉토리 경로 (기본값: `.taskaction`)

- **`slack_send_message`**: Slack 웹훅을 통한 메시지 전송

  - `message`: 전송할 메시지

- **`discord_send_message`**: Discord 웹훅을 통한 메시지 전송
  - `message`: 전송할 메시지

### 환경 변수

메시징 도구를 위해 다음 환경 변수를 구성하세요:

```bash
# slack_send_message 도구용 Slack 웹훅 URL
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# discord_send_message 도구용 Discord 웹훅 URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
```

## 🧪 테스트

### 테스트 실행

```bash
# 단위 테스트 실행
npm test

# 액션 테스트 실행
npm run test:actions

# 모든 액션 테스트 실행
npm run test:actions:all

# 모의(Mock) 모드로 액션 테스트
npm run test:actions:mock

# 통합 모드로 액션 테스트
npm run test:actions:integration

# E2E 모드로 액션 테스트
npm run test:actions:e2e

# HTML 출력으로 액션 테스트
npm run test:actions:html

# 특정 액션 테스트
npm run test:action:create-branch
npm run test:action:slack
npm run test:action:discord

# 타입별 액션 테스트
npm run test:actions:git
npm run test:actions:messaging

# 라이브 테스트
npm run test:live
npm run test:live:actions
npm run test:live:notify
```

### 테스트 구조

- **단위 테스트**: `tests/unit/`에 위치, Vitest 사용
- **통합 테스트**: `tests/integration/`에 위치, CLI와 MCP 서버 통합 테스트
- **E2E 테스트**: `tests/e2e/`에 위치, Playwright 사용
- **액션 테스트**: `tests/actions/`에 위치, 액션별 테스트
- **유틸리티**: `tests/utils/`에 위치, 테스트 유틸리티

## 🛠️ 개발

### 개발 스크립트

```bash
# 개발 서버 시작
npm run dev:server

# 개발 모드에서 CLI 시작
npm run dev:cli

# 프로젝트 빌드
npm run build

# 타입 검사
npm run type-check

# 린팅
npm run lint
npm run lint:fix

# 포매팅
npm run format
npm run format:check
```

### 새로운 도구 추가

1. **스키마 생성**: `src/schemas/`에 스키마 정의 추가
2. **로직 구현**: `src/core/tools/`에 비즈니스 로직 추가
3. **MCP 도구 추가**: `mcp-server/src/tools/`에 도구 등록
4. **CLI 명령 추가**: `src/cli/commands/`에 CLI 명령 생성
5. **테스트 작성**: 단위 테스트 및 통합 테스트 추가
6. **문서 업데이트**: README 및 예시 업데이트

### Assets 구성 추가

1. **액션 정의**: `assets/actions/`에 새로운 액션 YAML 파일 추가
2. **워크플로우 정의**: `assets/workflows/`에 워크플로우 추가
3. **규칙 정의**: `assets/rules/`에 개발 규칙 추가
4. **MCP 도구 정의**: `assets/mcps/`에 MCP 도구 설정 추가
5. **알림 설정**: `assets/notify/`에 알림 구성 추가
6. **템플릿 추가**: `assets/templates/`에 Mustache 템플릿 추가

### 프로젝트 구조 가이드라인

- **공유 로직**: `src/core/`에 재사용 가능한 비즈니스 로직 배치
- **스키마 검증**: `src/schemas/`에서 Zod 스키마 사용
- **타입 안전성**: 엄격한 TypeScript 타입 유지
- **Assets 기반**: YAML 파일을 통한 구성 관리
- **테스트**: 모든 새로운 기능에 대한 테스트 작성
- **문서화**: README 및 코드 주석 업데이트 유지

## 📚 예시

### Claude Desktop에서 사용

```
사용자: "새로운 Task Action 프로젝트를 초기화해줘"
Claude: init 도구를 사용하여 .taskaction 디렉토리와 구성 파일들 생성

사용자: "init 작업을 시작해줘"
Claude: start_task 도구를 사용하여 작업, 워크플로우, 규칙, MCP 프롬프트를 결합

사용자: "Slack에 '팀 안녕하세요!' 메시지를 보내줘"
Claude: slack_send_message 도구를 사용하여 메시지 전송

사용자: "새로운 작업을 추가해줘"
Claude: add_task 도구를 사용하여 대화형으로 새 작업 추가

사용자: "현재 작업 상태를 확인해줘"
Claude: task_status 도구를 사용하여 작업 상태 표시
```

### CLI에서 사용

```bash
# 프로젝트 초기화
npm run task-action init

# 작업 시작
npm run task-action start-task init                    # 간단한 프롬프트
npm run task-action start-task init --enhanced-prompt  # 향상된 프롬프트

# 작업 관리
npm run task-action add-task                           # 새 작업 추가
npm run task-action task-status                       # 작업 상태 확인

# 테스트 실행
npm run task-action test                               # 테스트 실행

# 메시지 전송
SLACK_WEBHOOK_URL="..." npm run task-action slack send-message "배포 완료!"
DISCORD_WEBHOOK_URL="..." npm run task-action discord send-message "서버 온라인!"
```

## 🤝 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요: `git checkout -b feature/amazing-feature`
3. 프로젝트 구조 가이드라인을 따라 변경사항을 만드세요
4. 새로운 기능에 대한 테스트를 추가하세요
5. 테스트와 린팅을 실행하세요: `npm test && npm run lint`
6. 변경사항을 커밋하세요: `git commit -m 'Add amazing feature'`
7. 브랜치에 푸시하세요: `git push origin feature/amazing-feature`
8. Pull Request를 열어주세요

## 📄 라이선스

이 프로젝트는 ISC 라이선스 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 링크

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [Claude Desktop](https://claude.ai/desktop)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. [Issues](https://github.com/weproud/task-action/issues) 페이지를 확인하세요
2. 상세한 정보와 함께 새로운 이슈를 생성하세요
3. 저장소에서 토론에 참여하세요

---

**Task Action MCP와 함께 즐거운 코딩하세요! 🚀**
