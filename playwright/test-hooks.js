const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const test = base.test;

test.beforeEach(async ({}, testInfo) => {
  logger.start(testInfo.title);
});

// Capture a screenshot if a test fails and attach it to the results.
test.afterEach(async ({ page }, testInfo) => {
  logger.end();
  if (!page) return;
  // Only capture screenshots for failing tests so the report stays concise.
  if (testInfo.status !== testInfo.expectedStatus) {
    const dir = path.join(__dirname, 'report', 'screenshots');
    await fs.promises.mkdir(dir, { recursive: true });
    const sanitized = testInfo.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    const filePath = path.join(dir, `${sanitized}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    testInfo.attachments.push({ name: 'screenshot', path: filePath, contentType: 'image/png' });
  }
});

module.exports = { test, expect: base.expect };
