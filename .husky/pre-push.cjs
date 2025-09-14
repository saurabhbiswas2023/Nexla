#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('🚀 Running pre-push build verification...');
  execSync('npm run husky:pre-push', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Build verification passed! Ready to push.');
} catch (error) {
  console.error('❌ Build verification failed:', error.message);
  process.exit(1);
}
