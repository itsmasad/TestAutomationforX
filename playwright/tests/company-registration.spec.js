const { test, expect } = require('../test-hooks');
const { CompanyRegistrationPage } = require('../pages/company-registration-page');
const { CompanyVerificationPage } = require('../pages/company-verification-page');
const { OdooPage } = require('../pages/odoo-page');
const testData = require('../testdata');

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

  // Test: company registration and verification flow using POM
  test('create and verify company account', async () => {
    const regPage = new CompanyRegistrationPage(page, context);
    await regPage.registerCompany();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();

    const verifyPage = new CompanyVerificationPage(page, regPage.mobile);
    // debugger;
    await verifyPage.completeVerification();

    // After verification steps navigate to the Odoo staging environment
    const odoo = new OdooPage(page);
    await odoo.goto();
    await odoo.login();
    // await page.pause();
    await odoo.openKybMyPipelines();
    await odoo.openFirstCompany();
    await odoo.verifyCompanyDetails({
      name: regPage.companyName,
      registration: regPage.registrationNumber,
      // phone: regPage.mobile,
      phone: regPage.mobile,
      email: testData.company.email,
      address: testData.company.addressLine1,
    });

    await odoo.acceptAndVerifyCompany();
  });
});
