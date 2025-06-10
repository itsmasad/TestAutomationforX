const { defineConfig } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const envUrls = {
  dev: process.env.DEV_URL,
  staging: process.env.STAGING_URL,
  production: process.env.PROD_URL,
};

const currentEnv = process.env.CURRENT_ENV || 'staging';
const baseURL = envUrls[currentEnv] || envUrls.staging;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  // <— run only one worker (i.e. serial execution)
  workers: 1,
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL,
  },
});
