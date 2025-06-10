const { test, expect } = require('../test-hooks');
const { CompanyRegistrationPage } = require('../pages/company-registration-page');

// This test covers the full company sign-up process

// Test: company registration flow using POM

test('create company account', async ({ page, context }) => {
  const regPage = new CompanyRegistrationPage(page, context);
  await regPage.registerCompany();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});
