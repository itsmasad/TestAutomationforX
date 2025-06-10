const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  // <— run only one worker (i.e. serial execution)
  workers: 1,
  timeout: 2 * 60 * 1000,         // 2 minutes
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
  },
});
