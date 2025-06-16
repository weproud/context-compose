#!/bin/bash

# Context Compose Test Automation Script
# Runs all tests and reports the results.

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# We will handle errors manually
# set -e

# --- Logging Functions ---
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_section() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "=================================================="
}

# --- Test Tracking ---
declare -i TOTAL_TESTS=0
declare -i PASSED_TESTS=0
declare -i FAILED_TESTS=0
declare -i SKIPPED_TESTS=0

# --- Test Execution Function ---
# Usage: run_test "Test Name" "command_to_run" [is_optional]
run_test() {
    local test_name="$1"
    local test_command="$2"
    local is_optional="${3:-false}"
    
    log_section "$test_name"
    ((TOTAL_TESTS++))

    if eval "$test_command"; then
        log_success "$test_name Passed"
        ((PASSED_TESTS++))
    else
        local exit_code=$?
        if [ "$is_optional" = "true" ]; then
            log_warning "$test_name Failed (Optional Test, exit code: $exit_code)"
            ((SKIPPED_TESTS++))
        else
            log_error "$test_name Failed (exit code: $exit_code)"
            ((FAILED_TESTS++))
        fi
    fi
}

# --- Main Execution ---
main() {
    local start_time
    start_time=$(date +%s)
    
    echo "🚀 Context Compose Test Automation Started"
    echo "Start Time: $(date)"
    
    # --- Test Suites ---
    run_test "Environment Verification" "pnpm --version > /dev/null"
    run_test "Dependency Installation" "pnpm install --quiet"
    run_test "Build Test" "pnpm build"
    run_test "Unit Tests" "pnpm test:unit"

    # --- Results Summary ---
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    log_section "Test Result Summary"
    echo "Total Test Suites: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "${YELLOW}Skipped: $SKIPPED_TESTS${NC}"
    echo "Execution Time: ${duration}s"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 All required tests passed!"
        echo "✨ CLI and MCP tools are working correctly."
        echo "🚀 Safe to deploy or commit."
        exit 0
    else
        log_error "💥 $FAILED_TESTS test(s) failed."
        echo "🔧 Please fix the failing tests and run again."
        exit 1
    fi
}

# --- Script Entry Point ---
main
