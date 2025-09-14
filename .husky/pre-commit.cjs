#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('🔍 Running pre-commit checks...');
  execSync('npm run husky:pre-commit', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Pre-commit checks passed!');
} catch (error) {
  console.error('❌ Pre-commit checks failed:', error.message);
  process.exit(1);
}
