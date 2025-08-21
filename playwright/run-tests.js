#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const envName = args[0];
if (!envName) {
  console.error('Usage: npm test <env> [playwright args]');
  process.exit(1);
}

process.env.CURRENT_ENV = envName;

// Create a unique log file path for this test run and expose it via the
// environment so that every worker writes to the same file.
const logsDir = path.join(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
process.env.LOG_FILE = path.join(logsDir, `${runTimestamp}.log`);

// Determine browser name from command line options. Default to chromium.
let browser = 'chromium';
for (const arg of args.slice(1)) {
  if (arg.startsWith('--browser=')) {
    browser = arg.split('=')[1];
    break;
  }
  if (arg.startsWith('--project=')) {
    browser = arg.split('=')[1];
  }
}

// Write environment info for Allure report.
try {
  const resultsDir = path.join(__dirname, 'allure-results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const envFile = path.join(resultsDir, 'environment.properties');
  fs.writeFileSync(envFile, `Environment=${envName}\nBrowser=${browser}\n`);
} catch (err) {
  console.error('Failed to write environment properties', err);
}

const result = spawnSync('npx', ['playwright', 'test', ...args.slice(1)], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status);
