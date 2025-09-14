@echo off
echo 🔍 Running pre-commit checks...
echo 📊 Generating quality report...
npm run husky:pre-commit
if %errorlevel% neq 0 (
    echo ❌ Pre-commit checks failed!
    exit /b 1
)
echo ✅ Pre-commit checks and quality report completed!
