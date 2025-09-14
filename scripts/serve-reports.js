#!/usr/bin/env node

/**
 * Quality Reports Server
 * 
 * Serves quality reports with a dashboard interface
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class ReportsServer {
  constructor(port = 3001) {
    this.port = port;
    this.reportsDir = path.join(__dirname, '..', 'reports');
    this.ensureReportsDirectory();
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  getReportsList() {
    try {
      const files = fs.readdirSync(this.reportsDir);
      const reports = files
        .filter(file => file.startsWith('quality-report-') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.reportsDir, file);
          const stats = fs.statSync(filePath);
          const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          return {
            filename: file,
            htmlFile: file.replace('.json', '.html'),
            timestamp: report.timestamp,
            commit: report.commit,
            score: report.summary.score,
            status: report.summary.score >= 90 ? 'excellent' : 
                   report.summary.score >= 70 ? 'good' : 'poor',
            size: stats.size,
            created: stats.mtime
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return reports;
    } catch (error) {
      return [];
    }
  }

  generateDashboard() {
    const reports = this.getReportsList();
    const latestReport = reports[0];
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Reports Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f8fafc; 
            color: #1e293b;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 2rem 0; 
            text-align: center;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .dashboard { padding: 2rem 0; }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 1.5rem; 
            margin-bottom: 2rem;
        }
        .stat-card { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-value { 
            font-size: 2.5rem; 
            font-weight: bold; 
            margin-bottom: 0.5rem;
        }
        .stat-label { color: #64748b; font-size: 0.875rem; }
        .excellent { color: #10b981; }
        .good { color: #f59e0b; }
        .poor { color: #ef4444; }
        .reports-table { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .table-header { 
            background: #f1f5f9; 
            padding: 1rem; 
            font-weight: 600;
        }
        .table-row { 
            display: grid; 
            grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr; 
            gap: 1rem; 
            padding: 1rem; 
            border-bottom: 1px solid #e2e8f0;
            align-items: center;
        }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: #f8fafc; }
        .score-badge { 
            padding: 0.25rem 0.75rem; 
            border-radius: 9999px; 
            font-size: 0.75rem; 
            font-weight: 600;
        }
        .score-excellent { background: #dcfce7; color: #166534; }
        .score-good { background: #fef3c7; color: #92400e; }
        .score-poor { background: #fee2e2; color: #991b1b; }
        .btn { 
            padding: 0.5rem 1rem; 
            border-radius: 6px; 
            text-decoration: none; 
            font-size: 0.875rem; 
            font-weight: 500;
            display: inline-block;
        }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .refresh-btn { 
            position: fixed; 
            bottom: 2rem; 
            right: 2rem; 
            background: #8b5cf6; 
            color: white; 
            border: none; 
            padding: 1rem; 
            border-radius: 50%; 
            cursor: pointer; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .refresh-btn:hover { background: #7c3aed; }
        @media (max-width: 768px) {
            .table-row { 
                grid-template-columns: 1fr; 
                gap: 0.5rem; 
                text-align: left;
            }
            .table-row > div:first-child { font-weight: 600; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>Quality Reports Dashboard</h1>
            <p>Comprehensive code quality tracking and analysis</p>
        </div>
    </div>
    
    <div class="container dashboard">
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value ${latestReport ? (latestReport.status === 'excellent' ? 'excellent' : latestReport.status === 'good' ? 'good' : 'poor') : 'poor'}">
                    ${latestReport ? latestReport.score + '%' : 'N/A'}
                </div>
                <div class="stat-label">Latest Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reports.length}</div>
                <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-card">
                <div class="stat-value excellent">${reports.filter(r => r.status === 'excellent').length}</div>
                <div class="stat-label">Excellent (90%+)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value good">${reports.filter(r => r.status === 'good').length}</div>
                <div class="stat-label">Good (70-89%)</div>
            </div>
        </div>
        
        <div class="reports-table">
            <div class="table-header">
                <h2>Quality Reports History</h2>
            </div>
            <div class="table-row" style="font-weight: 600; background: #f8fafc;">
                <div>Commit</div>
                <div>Score</div>
                <div>Status</div>
                <div>Date</div>
                <div>Author</div>
                <div>Actions</div>
            </div>
            ${reports.map(report => `
                <div class="table-row">
                    <div>
                        <div style="font-weight: 600;">${report.commit.hash}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${report.commit.message.substring(0, 50)}${report.commit.message.length > 50 ? '...' : ''}</div>
                    </div>
                    <div>
                        <span class="score-badge score-${report.status}">${report.score}%</span>
                    </div>
                    <div>${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</div>
                    <div style="font-size: 0.875rem;">${new Date(report.created).toLocaleDateString()}</div>
                    <div style="font-size: 0.875rem;">${report.commit.author}</div>
                    <div>
                        <a href="/${report.htmlFile}" class="btn btn-primary" target="_blank">View Report</a>
                    </div>
                </div>
            `).join('')}
            ${reports.length === 0 ? `
                <div class="table-row">
                    <div colspan="6" style="text-align: center; color: #64748b; grid-column: 1 / -1;">
                        No quality reports found. Run <code>npm run quality:report</code> to generate your first report.
                    </div>
                </div>
            ` : ''}
        </div>
    </div>
    
    <button class="refresh-btn" onclick="window.location.reload()" title="Refresh Dashboard">
        ↻
    </button>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => window.location.reload(), 30000);
    </script>
</body>
</html>`;
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (pathname === '/' || pathname === '/dashboard') {
      // Serve dashboard
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(this.generateDashboard());
      
    } else if (pathname.startsWith('/quality-report-') && pathname.endsWith('.html')) {
      // Serve HTML report
      const filename = pathname.substring(1);
      const filePath = path.join(this.reportsDir, filename);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Report not found');
      }
      
    } else if (pathname.startsWith('/quality-report-') && pathname.endsWith('.json')) {
      // Serve JSON report
      const filename = pathname.substring(1);
      const filePath = path.join(this.reportsDir, filename);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Report not found');
      }
      
    } else if (pathname === '/api/reports') {
      // API endpoint for reports list
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.getReportsList()));
      
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }

  start() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(this.port, () => {
      console.log(`📊 Quality Reports Dashboard running at:`);
      console.log(`🌐 http://localhost:${this.port}`);
      console.log(`📁 Reports directory: ${this.reportsDir}`);
      console.log(`\n💡 Available endpoints:`);
      console.log(`   • /dashboard - Main dashboard`);
      console.log(`   • /api/reports - Reports API`);
      console.log(`   • /quality-report-*.html - Individual reports`);
    });

    return server;
  }
}

// Start server if called directly
if (require.main === module) {
  const port = process.argv[2] || 3001;
  const server = new ReportsServer(port);
  server.start();
}

module.exports = ReportsServer;
