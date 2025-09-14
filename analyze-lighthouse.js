import fs from 'fs';

// Read reports
const landingReport = JSON.parse(fs.readFileSync('./lighthouse-landing.json', 'utf8'));
const chatReport = JSON.parse(fs.readFileSync('./lighthouse-chat.json', 'utf8'));
const prodLandingReport = JSON.parse(fs.readFileSync('./lighthouse-prod-landing.json', 'utf8'));

function analyzeReport(report, pageName) {
  console.log(`\n=== ${pageName.toUpperCase()} PAGE PERFORMANCE ===`);
  
  const categories = report.categories;
  console.log('Performance Score:', Math.round(categories.performance.score * 100));
  console.log('Accessibility Score:', Math.round(categories.accessibility.score * 100));
  console.log('Best Practices Score:', Math.round(categories['best-practices'].score * 100));
  console.log('SEO Score:', Math.round(categories.seo.score * 100));
  
  console.log('\n=== CORE WEB VITALS ===');
  const audits = report.audits;
  console.log('FCP (First Contentful Paint):', audits['first-contentful-paint'].displayValue);
  console.log('LCP (Largest Contentful Paint):', audits['largest-contentful-paint'].displayValue);
  console.log('CLS (Cumulative Layout Shift):', audits['cumulative-layout-shift'].displayValue);
  console.log('Speed Index:', audits['speed-index'].displayValue);
  console.log('Total Blocking Time:', audits['total-blocking-time'].displayValue);
  
  console.log('\n=== OPPORTUNITIES (>1s savings) ===');
  Object.keys(audits).forEach(key => {
    const audit = audits[key];
    if (audit.details && audit.details.overallSavingsMs && audit.details.overallSavingsMs > 1000) {
      console.log(`${audit.title}: ${Math.round(audit.details.overallSavingsMs)}ms savings`);
    }
  });
  
  console.log('\n=== DIAGNOSTICS ===');
  const diagnostics = [
    'unused-javascript',
    'unused-css-rules',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'legacy-javascript'
  ];
  
  diagnostics.forEach(key => {
    const audit = audits[key];
    if (audit && audit.score !== null && audit.score < 1) {
      console.log(`${audit.title}: ${audit.displayValue || 'Issues found'}`);
    }
  });
}

analyzeReport(landingReport, 'LANDING (DEV)');
analyzeReport(chatReport, 'CHAT (DEV)');
analyzeReport(prodLandingReport, 'LANDING (PRODUCTION)');

console.log('\n=== PERFORMANCE COMPARISON ===');
console.log('Development Scores:');
console.log('- Landing Page:', Math.round(landingReport.categories.performance.score * 100));
console.log('- Chat Page:', Math.round(chatReport.categories.performance.score * 100));
console.log('\nProduction Scores:');
console.log('- Landing Page:', Math.round(prodLandingReport.categories.performance.score * 100));
console.log('\nImprovement:', Math.round(prodLandingReport.categories.performance.score * 100) - Math.round(landingReport.categories.performance.score * 100), 'points');
console.log('\nTarget: 90+ for excellent performance');
