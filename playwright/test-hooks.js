const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const test = base.test;

// Capture a screenshot at the end of every test
// and attach it to the test results.
test.afterEach(async ({ page }, testInfo) => {
  if (!page) return;
  const dir = path.join(__dirname, 'report', 'screenshots');
  await fs.promises.mkdir(dir, { recursive: true });
  const sanitized = testInfo.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  const filePath = path.join(dir, `${sanitized}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  testInfo.attachments.push({ name: 'screenshot', path: filePath, contentType: 'image/png' });
});

module.exports = { test, expect: base.expect };
