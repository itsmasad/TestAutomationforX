const { test, expect } = require('../test-hooks');
const { CompanyRegistrationPage } = require('../pages/company-registration-page');
const { CompanyVerificationPage } = require('../pages/company-verification-page');

// Tests covering the company registration and verification flow.

test.describe.serial('company onboarding', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  // Test: company registration flow using POM
  test('create company account', async () => {
    const regPage = new CompanyRegistrationPage(page, context);
    await regPage.registerCompany();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });

  // Continue the onboarding by completing company verification in the same browser session.
  test('complete company verification', async () => {
    const verifyPage = new CompanyVerificationPage(page);
    await verifyPage.completeVerification();
  });
});
