#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('🔍 Running pre-commit checks...');
  console.log('📊 Generating quality report...');
  execSync('npm run husky:pre-commit', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Pre-commit checks and quality report completed!');
} catch (error) {
  console.error('❌ Pre-commit checks failed:', error.message);
  process.exit(1);
}
