const { test, expect } = require('@playwright/test');
const { CompanyRegistrationPage } = require('../pages/company-registration-page');

// Test: company registration flow using POM

test('create company account', async ({ page, context }) => {
  const regPage = new CompanyRegistrationPage(page, context);
  await regPage.registerCompany();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});
