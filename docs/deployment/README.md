# 🚀 **DEPLOYMENT DOCUMENTATION**

**Production Deployment and DevOps Guide**  
**Version 1.0.0** | **Enterprise-Grade Deployment**

---

## **📋 OVERVIEW**

This document provides comprehensive deployment guidelines for the Nexla Data Flow Architect application, covering build processes, environment configuration, deployment strategies, and production monitoring.

---

## **🏗️ BUILD PROCESS**

### **Production Build**
```bash
# Install dependencies
npm ci

# Run quality checks
npm run lint
npm run build        # TypeScript compilation + Vite build
npm audit --audit-level=moderate

# Generate quality report
npm run quality:report

# Preview production build
npm run preview
```

### **Build Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production for security
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          flow: ['@xyflow/react'],
          ui: ['lucide-react']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
```

### **Asset Optimization**
- **Code Splitting**: Route-based and vendor chunks
- **Tree Shaking**: Remove unused code
- **Minification**: Terser for JavaScript, CSS optimization
- **Compression**: Gzip and Brotli compression
- **Image Optimization**: WebP format with fallbacks

---

## **🌍 ENVIRONMENT CONFIGURATION**

### **Environment Variables**
```bash
# .env.production
VITE_OPENAI_API_KEY=your_production_api_key
VITE_APP_VERSION=1.0.0
VITE_BUILD_TIME=2024-01-01T00:00:00Z
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.nexla.com
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ANALYTICS_ID=your_analytics_id
```

### **Environment-Specific Builds**
```bash
# Development
npm run build:dev

# Staging
npm run build:staging

# Production
npm run build:prod
```

### **Configuration Management**
```typescript
// src/config/environment.ts
interface EnvironmentConfig {
  apiKey: string;
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildTime: string;
  features: {
    analytics: boolean;
    errorReporting: boolean;
    debugMode: boolean;
  };
}

export const config: EnvironmentConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.openai.com',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  features: {
    analytics: import.meta.env.VITE_ENVIRONMENT === 'production',
    errorReporting: import.meta.env.VITE_ENVIRONMENT !== 'development',
    debugMode: import.meta.env.VITE_ENVIRONMENT === 'development'
  }
};
```

---

## **☁️ DEPLOYMENT STRATEGIES**

### **Static Site Deployment**

#### **Netlify Deployment**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://openrouter.ai"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### **Vercel Deployment**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Security headers
COPY security-headers.conf /etc/nginx/conf.d/security-headers.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security headers
    include /etc/nginx/conf.d/security-headers.conf;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## **🔄 CI/CD PIPELINE**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run quality checks
        run: |
          npm run lint
          npm run build
          npm audit --audit-level=moderate
          npm run quality:report
      
      - name: Upload quality report
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: reports/

  test:
    runs-on: ubuntu-latest
    needs: quality-check
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [quality-check, test]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for staging
        run: npm run build:staging
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.STAGING_API_KEY }}
      
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    runs-on: ubuntu-latest
    needs: [quality-check, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for production
        run: npm run build:prod
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
      
      - name: Deploy to production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
      
      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false
```

### **Deployment Scripts**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Environment validation
if [ -z "$VITE_OPENAI_API_KEY" ]; then
  echo "❌ Error: VITE_OPENAI_API_KEY is not set"
  exit 1
fi

# Quality checks
echo "🔍 Running quality checks..."
npm run lint
npm run build
npm audit --audit-level=moderate

# Generate quality report
echo "📊 Generating quality report..."
npm run quality:report

# Check quality score
QUALITY_SCORE=$(node -e "
  const report = require('./reports/latest-report.json');
  console.log(report.summary.score);
")

if [ "$QUALITY_SCORE" -lt 70 ]; then
  echo "❌ Quality score ($QUALITY_SCORE%) below threshold (70%)"
  exit 1
fi

echo "✅ Quality score: $QUALITY_SCORE%"

# Run tests
echo "🧪 Running tests..."
npm run test:unit
npm run test:e2e

# Deploy
echo "🚀 Deploying to production..."
# Add deployment commands here

echo "✅ Deployment completed successfully!"
```

---

## **📊 MONITORING & ANALYTICS**

### **Performance Monitoring**
```typescript
// src/utils/monitoring.ts
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  errorRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    errorRate: 0
  };

  trackPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
    
    // Send to analytics
    this.sendMetrics('page_load', {
      loadTime: this.metrics.loadTime,
      url: window.location.pathname
    });
  }

  trackError(error: Error) {
    this.metrics.errorRate++;
    
    // Send to error reporting service
    this.sendError(error);
  }

  private sendMetrics(event: string, data: any) {
    if (config.features.analytics) {
      // Send to analytics service
      console.log('Analytics:', event, data);
    }
  }

  private sendError(error: Error) {
    if (config.features.errorReporting) {
      // Send to error reporting service
      console.error('Error reported:', error);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### **Health Checks**
```typescript
// src/utils/healthCheck.ts
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: boolean;
    localStorage: boolean;
    performance: boolean;
  };
  timestamp: number;
}

export const performHealthCheck = async (): Promise<HealthStatus> => {
  const checks = {
    api: await checkApiHealth(),
    localStorage: checkLocalStorageHealth(),
    performance: checkPerformanceHealth()
  };

  const allHealthy = Object.values(checks).every(check => check);
  const someHealthy = Object.values(checks).some(check => check);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    checks,
    timestamp: Date.now()
  };
};

const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Simple API health check
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok;
  } catch {
    return false;
  }
};

const checkLocalStorageHealth = (): boolean => {
  try {
    const testKey = '__health_check__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const checkPerformanceHealth = (): boolean => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const loadTime = navigation.loadEventEnd - navigation.fetchStart;
  return loadTime < 5000; // 5 second threshold
};
```

---

## **🔒 SECURITY CONFIGURATION**

### **Security Headers**
```nginx
# security-headers.conf
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
```

### **Environment Security**
```bash
# Secure environment variable handling
export VITE_OPENAI_API_KEY=$(vault kv get -field=api_key secret/nexla/openai)

# API key validation
if [[ ! "$VITE_OPENAI_API_KEY" =~ ^sk-[a-zA-Z0-9]{48}$ ]]; then
  echo "❌ Invalid API key format"
  exit 1
fi
```

---

## **📈 SCALING CONSIDERATIONS**

### **CDN Configuration**
```yaml
# CloudFlare configuration
cache_rules:
  - pattern: "*.js"
    cache_level: "cache_everything"
    edge_cache_ttl: 31536000  # 1 year
  
  - pattern: "*.css"
    cache_level: "cache_everything"
    edge_cache_ttl: 31536000  # 1 year
  
  - pattern: "/api/*"
    cache_level: "bypass"

security_rules:
  - rule: "Block malicious requests"
    expression: "(http.request.uri.path contains \"../\") or (http.request.uri.path contains \"<script\")"
    action: "block"
```

### **Load Balancing**
```yaml
# Load balancer configuration
upstream nexla_app {
    server app1.nexla.com:80 weight=3;
    server app2.nexla.com:80 weight=2;
    server app3.nexla.com:80 weight=1 backup;
}

server {
    listen 443 ssl http2;
    server_name nexla.com;
    
    location / {
        proxy_pass http://nexla_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## **🔧 TROUBLESHOOTING**

### **Common Deployment Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Verify environment variables
echo $VITE_OPENAI_API_KEY | wc -c  # Should be 49 characters
```

#### **Runtime Errors**
```typescript
// Error boundary for production
class ProductionErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Production error:', error, errorInfo);
    
    // Send to error reporting
    if (config.features.errorReporting) {
      // Report error to service
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or contact support.</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### **Performance Issues**
```bash
# Bundle analysis
npm run build
npx vite-bundle-analyzer dist

# Lighthouse audit
npx lighthouse https://your-domain.com --output=html --output-path=./lighthouse-report.html

# Performance monitoring
npm run reports:serve
```

---

## **📋 DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Quality score ≥ 70%
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Environment variables configured
- [ ] API keys validated
- [ ] Build optimization verified

### **Deployment**
- [ ] Production build successful
- [ ] Assets uploaded to CDN
- [ ] DNS configuration updated
- [ ] SSL certificates valid
- [ ] Health checks passing
- [ ] Monitoring configured

### **Post-Deployment**
- [ ] Application accessible
- [ ] All features functional
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] Analytics tracking active
- [ ] Backup systems verified

---

This deployment documentation ensures reliable, secure, and scalable production deployments with comprehensive monitoring and troubleshooting capabilities.
