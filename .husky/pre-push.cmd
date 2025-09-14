@echo off
echo 🚀 Running pre-push quality checks...
npm run husky:pre-push
if %errorlevel% neq 0 (
    echo ❌ Pre-push checks failed!
    exit /b 1
)
echo ✅ Pre-push checks passed!
