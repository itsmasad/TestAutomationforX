const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const testData = require('../testdata');

// Verify that a user can log into the application
test.skip('login with OTP', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});

// Ensure that the logout functionality works
test.skip('logout via icon', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);
  await loginPage.logout();
  await expect(page.getByLabel('Email address')).toBeVisible();
});
