const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');

test('login with OTP', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});

test('logout via icon', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login();
  await loginPage.logout();
  await expect(page.getByLabel('Email address')).toBeVisible();
});
