#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('🚀 Running pre-push quality checks...');
  execSync('npm run husky:pre-push', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Pre-push checks passed!');
} catch (error) {
  console.error('❌ Pre-push checks failed:', error.message);
  process.exit(1);
}
