@echo off
echo 🔍 Running pre-commit checks...
npm run husky:pre-commit
if %errorlevel% neq 0 (
    echo ❌ Pre-commit checks failed!
    exit /b 1
)
echo ✅ Pre-commit checks passed!
