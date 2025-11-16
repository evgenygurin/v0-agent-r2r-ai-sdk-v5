#!/usr/bin/env node
/**
 * System Health Check
 * Проверяет состояние всех сервисов и интеграций
 */

const https = require('https');
const http = require('http');

// Configuration
const R2R_BASE_URL = process.env.R2R_BASE_URL || 'http://136.119.36.216:7272';
const SENTRY_DSN = process.env.SENTRY_DSN;

const HEALTH_CHECKS = [
  {
    name: 'R2R Agent',
    url: `${R2R_BASE_URL}/v3/health`,
    critical: true,
    timeout: 5000
  },
  {
    name: 'R2R Dashboard',
    url: 'http://136.119.36.216:7273',
    critical: false,
    timeout: 3000
  },
  {
    name: 'Hatchet Workflow',
    url: 'http://136.119.36.216:7274',
    critical: false,
    timeout: 3000
  }
];

// Результаты проверок
const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  overall: 'healthy',
  critical_failures: 0,
  warnings: 0
};

/**
 * Выполняет HTTP запрос с таймаутом
 */
function makeRequest(url, timeout) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const startTime = Date.now();

    const req = client.get(url, { timeout }, (res) => {
      const duration = Date.now() - startTime;

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          duration,
          data
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      reject({ error: error.message, duration });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      reject({ error: 'Request timeout', duration });
    });
  });
}

/**
 * Проверка одного сервиса
 */
async function checkService(check) {
  console.log(`[Health Check] Checking ${check.name}...`);

  try {
    const result = await makeRequest(check.url, check.timeout);

    const status = result.statusCode >= 200 && result.statusCode < 300
      ? 'healthy'
      : 'unhealthy';

    const checkResult = {
      service: check.name,
      url: check.url,
      status,
      statusCode: result.statusCode,
      responseTime: result.duration,
      critical: check.critical,
      timestamp: new Date().toISOString()
    };

    if (status === 'unhealthy' && check.critical) {
      results.critical_failures++;
      results.overall = 'critical';
    } else if (status === 'unhealthy') {
      results.warnings++;
      if (results.overall === 'healthy') {
        results.overall = 'degraded';
      }
    }

    console.log(`[Health Check] ${check.name}: ${status} (${result.duration}ms)`);
    return checkResult;

  } catch (error) {
    console.error(`[Health Check] ${check.name}: FAILED - ${error.error}`);

    const checkResult = {
      service: check.name,
      url: check.url,
      status: 'unhealthy',
      error: error.error,
      responseTime: error.duration,
      critical: check.critical,
      timestamp: new Date().toISOString()
    };

    if (check.critical) {
      results.critical_failures++;
      results.overall = 'critical';
    } else {
      results.warnings++;
      if (results.overall === 'healthy') {
        results.overall = 'degraded';
      }
    }

    return checkResult;
  }
}

/**
 * Проверка всех сервисов
 */
async function runHealthChecks() {
  console.log('\n🏥 Starting System Health Checks...\n');

  for (const check of HEALTH_CHECKS) {
    const result = await checkService(check);
    results.checks.push(result);
  }

  // Сводка
  console.log('\n' + '='.repeat(60));
  console.log('HEALTH CHECK SUMMARY');
  console.log('='.repeat(60));
  console.log(`Overall Status: ${results.overall.toUpperCase()}`);
  console.log(`Critical Failures: ${results.critical_failures}`);
  console.log(`Warnings: ${results.warnings}`);
  console.log(`Total Checks: ${results.checks.length}`);
  console.log('='.repeat(60) + '\n');

  // Подробные результаты
  results.checks.forEach(check => {
    const emoji = check.status === 'healthy' ? '✅' : '❌';
    console.log(`${emoji} ${check.service}: ${check.status}`);
    if (check.error) {
      console.log(`   Error: ${check.error}`);
    }
    if (check.responseTime) {
      console.log(`   Response Time: ${check.responseTime}ms`);
    }
  });

  // Сохраняем результаты
  const fs = require('fs');
  const outputPath = '/tmp/health-check-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);

  // Выход с кодом ошибки при критических проблемах
  if (results.critical_failures > 0) {
    console.error('\n🚨 CRITICAL FAILURES DETECTED! 🚨\n');
    process.exit(1);
  } else if (results.overall === 'degraded') {
    console.warn('\n⚠️  System is degraded but operational\n');
    process.exit(0); // Не фейлим CI при некритических проблемах
  } else {
    console.log('\n✅ All systems operational!\n');
    process.exit(0);
  }
}

// Запуск
runHealthChecks().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});
