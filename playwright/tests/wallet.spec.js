const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { WalletPage } = require('../pages/wallet-page');
const testData = require('../testdata');

// Test adding funds to the company wallet
test.skip('company wallet add funds', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const wallet = new WalletPage(page);
  await wallet.open();
  await wallet.addFunds(testData.wallet.add.amount, testData.wallet.add.narrative);
  await expect(page.getByText(/Fund Added Successfully!/i)).toBeVisible();

  await loginPage.logout();
});

// Test withdrawing funds from the company wallet
test.skip('company wallet withdraw funds', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const wallet = new WalletPage(page);
  await wallet.open();
  await wallet.withdrawFunds(testData.wallet.withdraw.amount, testData.wallet.withdraw.narrative);
  await expect(page.getByText(/Fund Withdrawal Successful!/i)).toBeVisible();

  await loginPage.logout();
});
