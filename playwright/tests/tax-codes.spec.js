const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { TaxCodesPage } = require('../pages/tax-codes-page');
const testData = require('../testdata');

// Validate adding a new tax code under Settings > Accounting
// Skipped by default until the feature is ready for testing
test.skip('add new tax code', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const taxCodes = new TaxCodesPage(page);
  await taxCodes.open();
  await taxCodes.addTaxCode(testData.taxCode.name, testData.taxCode.rate);

  const row = taxCodes.findTaxCodeRow(testData.taxCode.name);
  await expect(row).toContainText(testData.taxCode.name);
  await expect(row).toContainText(`${testData.taxCode.rate}`);

  await loginPage.logout();
});
