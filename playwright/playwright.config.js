const { defineConfig } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const envUrls = {
  dev: process.env.DEV_URL,
  staging: process.env.STAGING_URL,
  prod: process.env.PROD_URL,
};

// The environment to run against is provided by the wrapper script `run-tests.js`
// which sets `CURRENT_ENV`. For backwards compatibility we also read
// `npm_config_env` when the script is invoked with `--env`.
const currentEnv = process.env.CURRENT_ENV || process.env.npm_config_env || 'staging';
const baseURL = envUrls[currentEnv] || envUrls.staging;

module.exports = defineConfig({
  testDir: './tests',
  retries: 0,
  // <— run only one worker (i.e. serial execution)
  workers: 1,
  timeout: 2 * 60 * 1000,         // 2 minutes
  reporter: [ ['list'], ['./custom-reporter.js'] ],
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL,
  },
});
