const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { PettyCashPage } = require('../pages/petty-cash-page');

test('petty cash add cash', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login();

  const pettyCash = new PettyCashPage(page);
  await pettyCash.open();
  await pettyCash.addCash('200', 'Adding petty cash');
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await loginPage.logout();
});

test('petty cash withdraw cash', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login();

  const pettyCash = new PettyCashPage(page);
  await pettyCash.open();
  await pettyCash.withdrawCash('100', 'Withdrawing petty cash');
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await loginPage.logout();
});
