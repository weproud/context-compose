.PHONY: all done check-fix test-run type-check build clean

# Default target
all: done

# Run all checks before committing
done: clean check-fix test-run type-check build
	@echo "✅ All checks passed. Ready to commit."

# Clean the build directory
clean:
	@echo "🧹 Cleaning up the build directory..."
	@rm -rf dist

# Fix linting and formatting issues
check-fix:
	@echo "🔍 Fixing linting and formatting issues..."
	@npm run check:fix

# Run tests
test-run:
	@echo "🧪 Running tests..."
	@npm run test:run

# Check types
type-check:
	@echo "🧐 Checking types..."
	@npm run type-check

# Build the project
build:
	@echo "🚀 Building the project..."
	@npm run build 