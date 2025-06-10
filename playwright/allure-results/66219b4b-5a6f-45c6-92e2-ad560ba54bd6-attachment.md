# Test info

- Name: create company account
- Location: C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\tests\company-registration.spec.js:8:1

# Error details

```
Error: page.screenshot: Target page, context or browser has been closed
Call log:
  - taking page screenshot
  - waiting for fonts to load...

    at C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\test-hooks.js:15:14
```

# Test source

```ts
   1 | const base = require('@playwright/test');
   2 | const fs = require('fs');
   3 | const path = require('path');
   4 |
   5 | const test = base.test;
   6 |
   7 | // Capture a screenshot at the end of every test
   8 | // and attach it to the test results.
   9 | test.afterEach(async ({ page }, testInfo) => {
  10 |   if (!page) return;
  11 |   const dir = path.join(__dirname, 'report', 'screenshots');
  12 |   await fs.promises.mkdir(dir, { recursive: true });
  13 |   const sanitized = testInfo.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  14 |   const filePath = path.join(dir, `${sanitized}.png`);
> 15 |   await page.screenshot({ path: filePath, fullPage: true });
     |              ^ Error: page.screenshot: Target page, context or browser has been closed
  16 |   testInfo.attachments.push({ name: 'screenshot', path: filePath, contentType: 'image/png' });
  17 | });
  18 |
  19 | module.exports = { test, expect: base.expect };
  20 |
```