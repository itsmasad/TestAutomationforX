const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  // <— run only one worker (i.e. serial execution)
  workers: 1,
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
  },
});
