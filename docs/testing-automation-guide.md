# 테스트 자동화 가이드

Context Compose의 포괄적인 테스트 자동화 시스템 사용법을 안내합니다.

## 🎯 목표

코드 수정 후 CLI와 MCP 도구의 정상 동작을 **자동으로 보증**하여 수동 검증의 부담을 없애고 개발 효율성을 극대화합니다.

## 📋 테스트 구조

### 1. Smoke Tests (`tests/smoke/`)

**목적**: 핵심 기능들의 빠른 검증

- CLI 기본 명령어 동작 확인
- 프로젝트 초기화 테스트
- MCP 서버 기본 동작 검증
- 파일 시스템 작업 테스트

**실행 시간**: ~30초
**실행 명령어**: `npm run test:smoke`

### 2. Unit Tests (`tests/unit/`)

**목적**: 개별 함수와 모듈의 상세 테스트

- 도구 함수들의 단위 테스트
- 에러 처리 로직 검증
- 스키마 검증 테스트

**실행 시간**: ~1분
**실행 명령어**: `npm run test:unit`

## 🚀 빠른 시작

### 1. 모든 테스트 실행

```bash
# 포괄적인 테스트 (권장)
npm run test:comprehensive

# 커버리지 포함 전체 테스트
npm run test:all

# 자동화 스크립트 (모든 검증 포함)
npm run test:automation
```

### 2. 개발 중 빠른 검증

```bash
# 핵심 기능만 빠르게 확인
npm run test:smoke

# 특정 테스트 파일만 실행
npx vitest tests/smoke/smoke.test.ts
```

### 3. 커버리지 확인

```bash
# 테스트 커버리지 생성
npm run test:coverage

# 커버리지 리포트 확인
open coverage/index.html
```

## 🔧 자동화 스크립트 사용법

### 기본 실행

```bash
# 모든 검증 실행
./scripts/test-automation.sh

# 또는 npm 스크립트로
npm run test:automation
```

### 옵션

```bash
# 간소한 출력
./scripts/test-automation.sh --quiet

# 상세한 출력
./scripts/test-automation.sh --verbose

# 도움말
./scripts/test-automation.sh --help
```

### 스크립트 기능

- ✅ 환경 검증 (Node.js, npm 버전 확인)
- ✅ 코드 품질 검사 (Biome, TypeScript)
- ✅ 빌드 테스트
- ✅ 모든 테스트 스위트 실행
- ✅ MCP 서버 검사
- ✅ 결과 요약 및 리포팅

## 🔄 CI/CD 통합

### GitHub Actions 워크플로우

프로젝트는 다음과 같은 CI/CD 파이프라인을 가지고 있습니다:

1. **코드 품질 검사**

   - Biome 린팅
   - TypeScript 타입 검사

2. **병렬 테스트 실행**

   - Smoke 테스트
   - 단위 테스트

3. **테스트 결과 요약**
   - 모든 테스트 결과 집계
   - 커버리지 리포트 생성
   - 실패 시 상세 로그 제공

### 브랜치 보호 규칙

- 모든 테스트 통과 시에만 merge 허용
- PR 생성 시 자동 테스트 실행
- 테스트 실패 시 배포 중단

## 📊 테스트 결과 해석

### 성공 시나리오

```
🎉 모든 테스트가 성공했습니다!
✅ CLI와 MCP 도구가 정상적으로 동작합니다.

테스트 결과 요약:
- 총 테스트 스위트: 5
- 통과: 5
- 실패: 0
- 건너뜀: 0
```

### 실패 시나리오

```
❌ 일부 테스트가 실패했습니다.
🔧 실패한 테스트를 확인하고 수정해주세요.

테스트 결과 요약:
- 총 테스트 스위트: 5
- 통과: 3
- 실패: 2
- 건너뜀: 0

실패한 테스트:
- Unit Tests: 스키마 검증 실패
- Smoke Tests: CLI 명령어 타임아웃
```

## 🛠️ 트러블슈팅

### 일반적인 문제들

#### 1. 테스트 타임아웃

**증상**: 테스트가 시간 초과로 실패
**해결책**:

```bash
# 타임아웃 시간 증가
VITEST_TIMEOUT=60000 npm run test:smoke
```

#### 2. 파일 권한 문제

**증상**: 파일 생성/삭제 실패
**해결책**:

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/test-automation.sh

# 임시 디렉토리 권한 확인
ls -la /tmp/
```

#### 3. MCP 서버 시작 실패

**증상**: MCP 서버 관련 테스트 실패
**해결책**:

```bash
# 수동으로 MCP 서버 검사
npx fastmcp inspect mcp-server/server.ts

# 빌드 후 재시도
npm run build
npx fastmcp inspect dist/mcp-server/server.js
```

#### 4. 의존성 문제

**증상**: 모듈을 찾을 수 없음 에러
**해결책**:

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm cache clean --force
```

## 📈 성능 최적화

### 테스트 실행 시간 단축

1. **병렬 실행**: 여러 테스트 스위트를 동시에 실행
2. **캐싱**: 빌드 결과와 의존성 캐싱
3. **선택적 실행**: 변경된 부분만 테스트

### 리소스 사용량 최적화

1. **메모리 관리**: 테스트 후 임시 파일 정리
2. **프로세스 관리**: 좀비 프로세스 방지
3. **동시 실행 제한**: 시스템 리소스 고려

## 🔮 향후 개선 계획

### Phase 2: 중기 개선

- [ ] 시각적 회귀 테스트
- [ ] 테스트 결과 대시보드

### Phase 3: 장기 최적화

- [ ] AI 기반 테스트 생성
- [ ] 자동 버그 리포트 생성
- [ ] 실시간 모니터링 통합

## 📞 지원

테스트 자동화 관련 문제가 있으면:

1. [GitHub Issues](https://github.com/weproud/context-compose/issues)에 문제 보고
2. 로그 파일과 함께 상세한 에러 메시지 제공
3. 환경 정보 (OS, Node.js 버전 등) 포함
