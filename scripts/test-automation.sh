#!/bin/bash

# Context Compose 테스트 자동화 스크립트
# 모든 테스트를 실행하고 결과를 리포팅합니다.

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_section() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "=================================================="
}

# 테스트 결과 추적
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# 테스트 실행 함수
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    local is_optional="${3:-false}"
    
    log_section "$test_name"
    
    if $test_command; then
        log_success "$test_name 통과"
        ((PASSED_TESTS++))
    else
        if [ "$is_optional" = "true" ]; then
            log_warning "$test_name 실패 (선택적 테스트)"
            ((SKIPPED_TESTS++))
        else
            log_error "$test_name 실패"
            ((FAILED_TESTS++))
            return 1
        fi
    fi
    
    ((TOTAL_TESTS++))
}

# 환경 검증
check_environment() {
    log_section "환경 검증"
    
    # Node.js 버전 확인
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 버전: $NODE_VERSION"
    else
        log_error "Node.js가 설치되지 않았습니다"
        exit 1
    fi
    
    # npm 확인
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        log_info "npm 버전: $NPM_VERSION"
    else
        log_error "npm이 설치되지 않았습니다"
        exit 1
    fi
    
    # 의존성 설치 확인
    if [ ! -d "node_modules" ]; then
        log_info "의존성 설치 중..."
        npm install
    fi
    
    log_success "환경 검증 완료"
}

# 코드 품질 검사
check_code_quality() {
    log_section "코드 품질 검사"

    # TypeScript 타입 검사 (더 중요한 검사를 먼저)
    if npm run type-check; then
        log_success "TypeScript 타입 검사 통과"
    else
        log_error "TypeScript 타입 검사 실패"
        return 1
    fi

    # Biome 검사 (경고는 허용)
    npm run check
    local biome_exit_code=$?

    if [ $biome_exit_code -eq 0 ]; then
        log_success "Biome 검사 통과 (에러 없음)"
    elif [ $biome_exit_code -eq 1 ]; then
        # 에러가 있는 경우에만 실패로 처리
        if npm run check 2>&1 | grep -q "Found.*errors"; then
            log_error "Biome 검사 실패 (에러 발견)"
            return 1
        else
            log_warning "Biome 검사 통과 (경고만 있음)"
        fi
    else
        log_error "Biome 검사 실행 실패"
        return 1
    fi
}

# 빌드 테스트
test_build() {
    log_section "빌드 테스트"
    
    # 기존 빌드 결과 정리
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    # 빌드 실행
    if npm run build; then
        log_success "빌드 성공"
        
        # 빌드 결과 확인
        if [ -f "dist/src/cli/index.js" ] && [ -f "dist/mcp-server/server.js" ]; then
            log_success "빌드 결과 파일 확인 완료"
        else
            log_error "빌드 결과 파일이 누락되었습니다"
            return 1
        fi
    else
        log_error "빌드 실패"
        return 1
    fi
}

# 메인 실행 함수
main() {
    local start_time=$(date +%s)
    
    echo "🚀 Context Compose 테스트 자동화 시작"
    echo "시작 시간: $(date)"
    echo ""
    
    # 환경 검증
    check_environment
    
    # 코드 품질 검사
    run_test_suite "코드 품질 검사" check_code_quality
    
    # 빌드 테스트
    run_test_suite "빌드 테스트" test_build
    
    # Smoke 테스트 (가장 중요)
    run_test_suite "Smoke 테스트" "npm run test:smoke"
    
    # 단위 테스트
    run_test_suite "단위 테스트" "npm run test:unit"
    
    # MCP 서버 검사 (선택적)
    run_test_suite "MCP 서버 검사" "npm run inspect" true
    
    # 커버리지 테스트 (선택적)
    run_test_suite "커버리지 테스트" "npm run test:coverage" true
    
    # 결과 요약
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    log_section "테스트 결과 요약"
    echo "총 테스트 스위트: $TOTAL_TESTS"
    echo "통과: $PASSED_TESTS"
    echo "실패: $FAILED_TESTS"
    echo "건너뜀: $SKIPPED_TESTS"
    echo "실행 시간: ${duration}초"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 모든 필수 테스트가 통과했습니다!"
        echo ""
        echo "✨ CLI와 MCP 도구가 정상적으로 동작합니다."
        echo "🚀 안전하게 배포하거나 커밋할 수 있습니다."
        exit 0
    else
        log_error "💥 $FAILED_TESTS개의 테스트가 실패했습니다."
        echo ""
        echo "🔧 실패한 테스트를 수정한 후 다시 실행해주세요."
        echo "📋 상세한 에러 로그를 확인하여 문제를 해결하세요."
        exit 1
    fi
}

# 도움말 표시
show_help() {
    echo "Context Compose 테스트 자동화 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -h, --help     이 도움말 표시"
    echo "  -q, --quiet    간소한 출력"
    echo "  -v, --verbose  상세한 출력"
    echo ""
    echo "예시:"
    echo "  $0              # 모든 테스트 실행"
    echo "  $0 --quiet      # 간소한 출력으로 실행"
    echo "  $0 --verbose    # 상세한 출력으로 실행"
}

# 명령행 인수 처리
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -q|--quiet)
            # 간소한 출력 모드
            exec > /dev/null 2>&1
            shift
            ;;
        -v|--verbose)
            # 상세한 출력 모드
            set -x
            shift
            ;;
        *)
            log_error "알 수 없는 옵션: $1"
            show_help
            exit 1
            ;;
    esac
done

# 메인 함수 실행
main
