const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const testData = require('../testdata');

// Verify that a user can log into the application
test('login with OTP', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.company.email, testData.company.password);
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});

// Ensure that the logout functionality works
test('logout via icon', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.company.email, testData.company.password);
  await loginPage.logout();
  await expect(page.getByLabel('Email address')).toBeVisible();
});
