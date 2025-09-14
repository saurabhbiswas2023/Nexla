@echo off
echo 🚀 Running pre-push build verification...
npm run husky:pre-push
if %errorlevel% neq 0 (
    echo ❌ Build verification failed!
    exit /b 1
)
echo ✅ Build verification passed! Ready to push.
