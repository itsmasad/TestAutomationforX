const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { WalletPage } = require('../pages/wallet-page');

test('company wallet add funds', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login();

  const wallet = new WalletPage(page);
  await wallet.open();
  await wallet.addFunds('1000', 'Adding Fund');
  await expect(page.getByText(/Fund Added Successfully!/i)).toBeVisible();

  await loginPage.logout();
});

test('company wallet withdraw funds', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login();

  const wallet = new WalletPage(page);
  await wallet.open();
  await wallet.withdrawFunds('500', 'Withdrawing Fund');
  await expect(page.getByText(/Fund Withdrawal Successful!/i)).toBeVisible();

  await loginPage.logout();
});
