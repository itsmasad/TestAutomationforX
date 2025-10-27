const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { WalletPage } = require('../pages/wallet-page');
const testData = require('../testdata');

// Run wallet add and withdraw in a single login session.
test.describe.serial('wallet', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;
  /** @type {WalletPage} */
  let wallet;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
    await loginPage.login(testData.credentials.email, testData.credentials.password);
    wallet = new WalletPage(page);
  });

  test.afterAll(async () => {
    await loginPage.logout();
    await context.close();
  });

  // Test adding funds to the company wallet
  test('add funds', async () => {
    await wallet.open();
    await wallet.addFunds(testData.wallet.add.amount, testData.wallet.add.narrative);
    // Assert success immediately after OTP verification
    const successToast = page.locator('.Toastify__toast--success').last();
    await expect(successToast).toBeVisible();
    // Finalize navigation per flow
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  // Test withdrawing funds from the company wallet
  test('withdraw funds', async () => {
    await wallet.open();
    await wallet.withdrawFunds(testData.wallet.withdraw.amount, testData.wallet.withdraw.narrative);
    // Assert success immediately after OTP verification
    const successToast = page.locator('.Toastify__toast--success').last();
    await expect(successToast).toBeVisible();
    // Flow specifies Cancel on next screen
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});

