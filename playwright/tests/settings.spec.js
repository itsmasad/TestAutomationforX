const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { SettingsPage } = require('../pages/settings-page');
const testData = require('../testdata');

// Run tax code and category group tests in a single login session.
test.describe.serial('settings', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;
  /** @type {SettingsPage} */
  let settings;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
    await loginPage.login(testData.credentials.email, testData.credentials.password);
    settings = new SettingsPage(page);
  });

  test.afterAll(async () => {
    if (loginPage) {
      await loginPage.logout();
    }
    if (context) {
      await context.close();
    }
  });

  test('add new tax code', async () => {
    await settings.openTaxCodes();
    await settings.addTaxCode(testData.taxCode.name, testData.taxCode.rate);
    const taxToast = page.locator('.Toastify__toast--success').last();
    await expect(taxToast).toBeVisible();
    await taxToast.waitFor({ state: 'hidden' });
    const taxRow = settings.findTaxCodeRow(testData.taxCode.name);
    await expect(taxRow).toContainText(testData.taxCode.name);
    await expect(taxRow).toContainText(`${testData.taxCode.rate}`);
  });

  test('add new category group', async () => {
    await settings.openCategories();
    await settings.addCategoryGroup(testData.categoryGroup.name);
    const groupToast = page.locator('.Toastify__toast--success').last();
    await expect(groupToast).toBeVisible();
    await groupToast.waitFor({ state: 'hidden' });
    const groupRow = settings.findCategoryGroupRow(testData.categoryGroup.name);
    await expect(groupRow).toContainText(testData.categoryGroup.name);
  });

  test.only('add new payment method (bank account)', async () => {
    await settings.openPaymentMethods();

    const bankName = 'Qatar National Bank (QNB)';
    const accountName = testData.companyMeta.name || 'Test Company';
    const swift = 'QNBAQAQAXXX';
    const randomDigits = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('');
    const iban = `QNB${randomDigits}`;
    const address = testData.company.addressLine1 || 'Test Address';

    await settings.addBankAccount(bankName, accountName, swift, iban, address);

    const successToast = page.locator('.Toastify__toast--success').last();
    await expect(successToast).toBeVisible();
  });
});
