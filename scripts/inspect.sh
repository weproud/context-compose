#!/bin/bash

# MCP Inspector 실행 스크립트
# 사용법: ./scripts/inspect.sh [옵션]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 도움말 함수
show_help() {
    echo -e "${BLUE}MCP Inspector 실행 스크립트${NC}"
    echo ""
    echo "사용법:"
    echo "  ./scripts/inspect.sh [옵션]"
    echo ""
    echo "옵션:"
    echo "  -h, --help     이 도움말 표시"
    echo "  -b, --built    빌드된 JavaScript 파일로 실행"
    echo "  -t, --ts       TypeScript 파일로 실행 (기본값)"
    echo ""
    echo "예시:"
    echo "  ./scripts/inspect.sh           # TypeScript 파일로 실행"
    echo "  ./scripts/inspect.sh --built   # 빌드된 JS 파일로 실행"
}

# 기본값
USE_BUILT=false

# 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--built)
            USE_BUILT=true
            shift
            ;;
        -t|--ts)
            USE_BUILT=false
            shift
            ;;
        *)
            echo -e "${RED}❌ 알 수 없는 옵션: $1${NC}"
            echo "도움말을 보려면 --help를 사용하세요."
            exit 1
            ;;
    esac
done

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

echo -e "${BLUE}🔍 MCP Inspector 시작 중...${NC}"

if [ "$USE_BUILT" = true ]; then
    echo -e "${YELLOW}📦 빌드된 JavaScript 파일 사용${NC}"
    
    # 빌드 파일이 있는지 확인
    if [ ! -f "dist/server/index.js" ]; then
        echo -e "${YELLOW}⚠️  빌드 파일이 없습니다. 빌드를 먼저 실행합니다...${NC}"
        npm run build
    fi
    
    echo -e "${GREEN}🚀 MCP Inspector 실행 중 (빌드된 파일)...${NC}"
    npm run inspect:built
else
    echo -e "${YELLOW}📝 TypeScript 파일 사용${NC}"
    echo -e "${GREEN}🚀 MCP Inspector 실행 중 (TypeScript)...${NC}"
    npm run inspect
fi
