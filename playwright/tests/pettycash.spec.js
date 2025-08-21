const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { PettyCashPage } = require('../pages/petty-cash-page');
const testData = require('../testdata');

// Run petty cash add and withdraw in a single login session.
test.describe.serial('petty cash', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;
  /** @type {PettyCashPage} */
  let pettyCash;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
    await loginPage.login(testData.credentials.email, testData.credentials.password);
    pettyCash = new PettyCashPage(page);
  });

  test.afterAll(async () => {
    await loginPage.logout();
    await context.close();
  });

  // Validate adding money to petty cash
  test('add cash', async () => {
    await pettyCash.open();
    await pettyCash.addCash(testData.pettyCash.add.amount, testData.pettyCash.add.description);
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  });

  // Validate withdrawing money from petty cash
  test('withdraw cash', async () => {
    await pettyCash.open();
    await pettyCash.withdrawCash(testData.pettyCash.withdraw.amount, testData.pettyCash.withdraw.description);
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  });
});

