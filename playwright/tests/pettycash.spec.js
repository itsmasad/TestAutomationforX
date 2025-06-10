const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { PettyCashPage } = require('../pages/petty-cash-page');
const testData = require('../testdata');

// Validate adding money to petty cash
test('petty cash add cash', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const pettyCash = new PettyCashPage(page);
  await pettyCash.open();
  await pettyCash.addCash(testData.pettyCash.add.amount, testData.pettyCash.add.description);
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await loginPage.logout();
});

// Validate withdrawing money from petty cash
test('petty cash withdraw cash', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const pettyCash = new PettyCashPage(page);
  await pettyCash.open();
  await pettyCash.withdrawCash(testData.pettyCash.withdraw.amount, testData.pettyCash.withdraw.description);
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await loginPage.logout();
});
