# Augment Guidelines for Context Compose

## 📋 프로젝트 개요

**Context Compose**는 AI 개발 워크플로우를 위한 Model Context Protocol (MCP) 서버 및 CLI 도구입니다. AI 어시스턴트가 프로젝트별 컨텍스트, 워크플로우, 규칙을 체계적으로 관리할 수 있도록 도와줍니다.

### 🎯 핵심 기능

- **MCP Server**: Claude, ChatGPT 등 AI 모델과의 직접 통합
- **CLI Tool**: 터미널에서 컨텍스트 관리 및 워크플로우 실행
- **Context System**: 프로젝트별 개발 가이드라인 및 규칙 관리
- **Workflow Engine**: 개발, 테스트, 배포를 위한 자동화된 작업 흐름
- **Role-based Development**: Dan Abramov, Martin Fowler 등 전문가 페르소나 적용
- **Notification System**: Slack, 이메일 등을 통한 작업 상태 알림

## 🏗️ 아키텍처

### 기술 스택

- **언어**: TypeScript (ES2022)
- **런타임**: Node.js >=18.0.0
- **패키지 매니저**: pnpm
- **빌드 도구**: TypeScript Compiler (tsc)
- **테스트**: Vitest
- **린팅**: ESLint 9.x + TypeScript ESLint
- **포매팅**: Prettier
- **MCP 프레임워크**: FastMCP 2.2.1

### 프로젝트 구조

```
context-compose/
├── src/                    # CLI 도구 소스코드
│   ├── cli/               # CLI 명령어 구현
│   ├── core/              # 핵심 로직 (환경변수, 유틸리티)
│   ├── schemas/           # Zod 스키마 정의
│   └── types/             # TypeScript 타입 정의
├── mcp-server/            # MCP 서버 구현
│   ├── src/
│   │   ├── tools/         # MCP 도구들 (init, get-context)
│   │   ├── index.ts       # 메인 서버 클래스
│   │   └── logger.ts      # 로깅 유틸리티
│   └── server.ts          # 서버 엔트리포인트
├── assets/                # 기본 컨텍스트 및 설정 파일들
│   ├── *-context.yaml    # 다양한 컨텍스트 정의
│   ├── workflows/         # 워크플로우 정의
│   ├── rules/             # 개발 규칙
│   ├── roles/             # 역할 정의
│   ├── mcps/              # MCP 도구 설정
│   └── notify/            # 알림 설정
├── tests/                 # 테스트 파일들
├── bin/                   # 실행 가능한 스크립트들
└── dist/                  # 빌드 결과물
```

## 🛠️ 개발 가이드라인

### 코드 스타일

- **TypeScript Strict Mode** 사용
- **ESLint + Prettier** 설정 준수
- **함수형 프로그래밍** 스타일 선호
- **명시적 타입 정의** (any 타입 지양)
- **에러 핸들링** 필수 구현

### 네이밍 컨벤션

- **파일명**: kebab-case (`get-context.ts`)
- **클래스명**: PascalCase (`ContextComposeServer`)
- **함수/변수명**: camelCase (`registerMCPTools`)
- **상수명**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG_DIR`)
- **타입명**: PascalCase (`InitToolInput`)

### 파일 구조 규칙

- **단일 책임 원칙**: 각 파일은 하나의 명확한 목적
- **인덱스 파일**: 각 디렉토리에 `index.ts`로 export 관리
- **스키마 분리**: Zod 스키마는 별도 파일로 관리
- **타입 정의**: 공통 타입은 `src/types/` 디렉토리에 집중

## 🔧 개발 워크플로우

### 1. 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm context-compose

# 빌드
pnpm build

# 테스트
pnpm test

# 린팅 및 포매팅
pnpm lint:fix
pnpm format
```

### 2. 새 기능 개발

1. **브랜치 생성**: `feature/기능명` 형태
2. **개발**: TDD 방식 권장
3. **테스트 작성**: 단위 테스트 필수
4. **린팅**: `pnpm lint:fix` 실행
5. **타입 체크**: `pnpm type-check` 실행
6. **커밋**: Conventional Commits 형식
7. **PR 생성**: 코드 리뷰 후 머지

### 3. MCP 도구 추가

```typescript
// 1. 스키마 정의 (src/schemas/)
export const NewToolSchema = z.object({
  param: z.string().describe('Parameter description'),
});

// 2. 도구 구현 (mcp-server/src/tools/)
export function registerNewTool(server: FastMCP): void {
  server.tool('new-tool', NewToolSchema, async params => {
    // 구현 로직
    return { result: 'success' };
  });
}

// 3. 도구 등록 (mcp-server/src/tools/index.ts)
import { registerNewTool } from './new-tool.js';
registerNewTool(server);
```

## 📝 문서화 규칙

### 코드 주석

- **JSDoc 형식** 사용
- **함수/클래스**: 목적과 매개변수 설명
- **복잡한 로직**: 인라인 주석으로 설명
- **TODO/FIXME**: 명확한 설명과 담당자 표기

### README 업데이트

- **새 기능 추가시**: 사용법 예시 포함
- **API 변경시**: 마이그레이션 가이드 제공
- **설정 변경시**: 설정 예시 업데이트

## 🧪 테스트 전략

### 테스트 구조

```
tests/
├── unit/              # 단위 테스트
│   ├── tools.test.ts  # MCP 도구 테스트
│   └── core.test.ts   # 핵심 로직 테스트
├── integration/       # 통합 테스트
└── fixtures/          # 테스트 데이터
```

### 테스트 작성 규칙

- **각 함수/클래스**: 최소 1개 이상의 테스트
- **에러 케이스**: 예외 상황 테스트 포함
- **모킹**: 외부 의존성은 모킹 처리
- **테스트 데이터**: fixtures 디렉토리 활용

## 🚀 배포 가이드라인

### 버전 관리

- **Semantic Versioning** 준수
- **MAJOR**: 호환성 깨지는 변경
- **MINOR**: 새 기능 추가
- **PATCH**: 버그 수정

### 배포 체크리스트

- [ ] 모든 테스트 통과
- [ ] 린팅 오류 없음
- [ ] 타입 체크 통과
- [ ] 문서 업데이트
- [ ] CHANGELOG 작성
- [ ] 버전 태그 생성

## 🔍 디버깅 가이드

### 로깅

- **Logger 사용**: `mcp-server/src/logger.ts` 활용
- **로그 레벨**: debug, info, warn, error
- **구조화된 로깅**: 메타데이터 포함

### 개발 도구

```bash
# MCP 서버 검사
pnpm inspect

# 빌드된 서버 검사
pnpm inspect:built

# 타입 체크만 실행
pnpm type-check
```

## 🎯 Context Compose 특화 가이드라인

### Context 파일 작성 규칙

```yaml
# 기본 구조
version: 1
kind: task # task, workflow, rule, role, mcp, notify
name: 'context-name'
description: 'Context description'

id: context-id
context:
  workflow: workflows/workflow.yaml
  roles:
    - roles/expert.yaml
  rules:
    - rules/coding-standards.yaml
  mcps:
    - mcps/tool-config.yaml
  notify:
    - notify/slack.yaml
prompt: |
  # Context-specific instructions
```

### Workflow 정의 규칙

```yaml
version: 1
kind: workflow
name: Workflow Name
description: Workflow description
jobs:
  steps:
    - name: Step Name
      uses: actions/action-name.yaml
      with:
        param: value
```

### MCP 도구 개발 패턴

```typescript
// 1. 입력 검증
const validatedInput = schema.parse(params);

// 2. 비즈니스 로직 실행
const result = await executeLogic(validatedInput);

// 3. 에러 핸들링
if (!result.success) {
  throw new Error(`Operation failed: ${result.error}`);
}

// 4. 응답 반환
return {
  content: [
    {
      type: 'text',
      text: result.message,
    },
  ],
};
```

### 환경 변수 관리

```typescript
// src/core/env.ts 사용
import { EnvManager } from '@/core/env';

// 필수 환경변수
const apiKey = EnvManager.getRequired('API_KEY');

// 선택적 환경변수
const debug = EnvManager.get('DEBUG', 'false');
```

## 🚨 주의사항 및 베스트 프랙티스

### 보안 가이드라인

- **환경변수**: 민감한 정보는 반드시 환경변수로 관리
- **입력 검증**: 모든 사용자 입력은 Zod 스키마로 검증
- **파일 경로**: 경로 조작 공격 방지를 위한 검증 필수
- **에러 메시지**: 민감한 정보 노출 금지

### 성능 최적화

- **비동기 처리**: I/O 작업은 반드시 비동기로 처리
- **메모리 관리**: 대용량 파일 처리시 스트림 사용
- **캐싱**: 반복적인 파일 읽기는 캐싱 고려
- **에러 핸들링**: 적절한 에러 복구 메커니즘 구현

### 코드 품질

```typescript
// ✅ 좋은 예시
export async function processContext(
  contextPath: string,
  options: ProcessOptions
): Promise<ProcessResult> {
  const validatedOptions = ProcessOptionsSchema.parse(options);

  try {
    const context = await loadContext(contextPath);
    return await executeWorkflow(context, validatedOptions);
  } catch (error) {
    logger.error('Context processing failed', { contextPath, error });
    throw new MCPError('Failed to process context', 'CONTEXT_PROCESS_ERROR');
  }
}

// ❌ 나쁜 예시
export function processContext(path: any, opts: any): any {
  const ctx = JSON.parse(fs.readFileSync(path));
  return doStuff(ctx, opts);
}
```

### 테스트 작성 가이드

```typescript
// 단위 테스트 예시
describe('Context Processing', () => {
  it('should process valid context successfully', async () => {
    // Arrange
    const mockContext = createMockContext();
    const options = { enhancedPrompt: true };

    // Act
    const result = await processContext('/path/to/context', options);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle invalid context gracefully', async () => {
    // Arrange
    const invalidPath = '/invalid/path';

    // Act & Assert
    await expect(processContext(invalidPath, {})).rejects.toThrow(
      'Failed to process context'
    );
  });
});
```

## 🔄 CI/CD 가이드라인

### GitHub Actions 워크플로우

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build
```

### 코드 리뷰 체크리스트

- [ ] 타입 안정성 확보
- [ ] 에러 핸들링 적절성
- [ ] 테스트 커버리지 충분성
- [ ] 문서화 완성도
- [ ] 성능 영향도 검토
- [ ] 보안 취약점 검토

## 📚 참고 자료

### 내부 문서

- [README.md](./README.md): 프로젝트 개요 및 사용법
- [assets/](./assets/): 기본 컨텍스트 및 설정 예시
- [tests/](./tests/): 테스트 예시
- [package.json](./package.json): 프로젝트 설정 및 스크립트
- [tsconfig.json](./tsconfig.json): TypeScript 설정

### 외부 문서

- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [ESLint Documentation](https://eslint.org/)

## 🤝 기여 가이드라인

### 이슈 생성

1. **버그 리포트**: 재현 단계, 예상 결과, 실제 결과 포함
2. **기능 요청**: 사용 사례, 제안된 API, 대안 고려사항 포함
3. **질문**: 명확한 컨텍스트와 시도한 해결책 포함

### Pull Request 가이드

1. **브랜치명**: `feature/기능명`, `fix/버그명`, `docs/문서명`
2. **커밋 메시지**: Conventional Commits 형식
   ```
   feat: add new context validation tool
   fix: resolve path resolution issue in Windows
   docs: update installation guide
   test: add unit tests for MCP tools
   ```
3. **PR 설명**: 변경사항, 테스트 방법, 체크리스트 포함

### 코드 리뷰 프로세스

1. **자동 검사**: CI/CD 파이프라인 통과 필수
2. **코드 리뷰**: 최소 1명의 승인 필요
3. **테스트**: 새 기능은 테스트 코드 포함 필수
4. **문서**: API 변경시 문서 업데이트 필수

## 🔧 트러블슈팅

### 자주 발생하는 문제들

#### 1. MCP 서버 연결 실패

```bash
# 서버 상태 확인
pnpm inspect

# 로그 확인
DEBUG=* pnpm context-compose

# 포트 충돌 확인
lsof -i :3000
```

#### 2. TypeScript 컴파일 오류

```bash
# 타입 정의 재설치
pnpm install --force

# 캐시 클리어
rm -rf node_modules/.cache
rm -rf dist/

# 타입 체크
pnpm type-check
```

#### 3. 테스트 실패

```bash
# 단일 테스트 실행
pnpm test -- --run specific.test.ts

# 커버리지 확인
pnpm test -- --coverage

# 테스트 디버깅
pnpm test -- --reporter=verbose
```

### 성능 모니터링

```typescript
// 성능 측정 예시
import { performance } from 'perf_hooks';

const start = performance.now();
await processContext(contextPath);
const end = performance.now();
logger.info(`Context processing took ${end - start}ms`);
```

## 📈 로드맵 및 향후 계획

### 단기 목표 (1-3개월)

- [ ] 추가 MCP 도구 개발
- [ ] 성능 최적화
- [ ] 문서 개선
- [ ] 테스트 커버리지 향상

### 중기 목표 (3-6개월)

- [ ] 웹 UI 개발
- [ ] 플러그인 시스템 구축
- [ ] 다국어 지원
- [ ] 클라우드 배포 지원

### 장기 목표 (6개월+)

- [ ] 엔터프라이즈 기능
- [ ] AI 모델 통합 확장
- [ ] 커뮤니티 생태계 구축
- [ ] 상용 서비스 출시

---

## 📞 연락처 및 지원

- **GitHub Issues**: [프로젝트 이슈](https://github.com/weproud/context-compose/issues)
- **GitHub Discussions**: [커뮤니티 토론](https://github.com/weproud/context-compose/discussions)
- **Email**: [프로젝트 이메일](mailto:betheproud@gmail.com)

이 가이드라인을 따라 일관성 있고 품질 높은 코드를 작성해주세요. 질문이나 제안사항이 있으면 언제든 이슈를 생성하거나 토론에 참여해주세요.

**Happy Coding! 🚀**
