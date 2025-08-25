const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { SettingsPage } = require('../pages/settings-page');
const testData = require('../testdata');

// Validate adding a new tax code under Settings > Accounting
// Skipped by default until the feature is ready for testing
test.skip('add new tax code', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const settings = new SettingsPage(page);
  await settings.openTaxCodes();
  await settings.addTaxCode(testData.taxCode.name, testData.taxCode.rate);

  const successToast = page.locator('.Toastify__toast--success').last();
  await expect(successToast).toBeVisible();
  await successToast.waitFor({ state: 'hidden' });

  const row = settings.findTaxCodeRow(testData.taxCode.name);
  await expect(row).toContainText(testData.taxCode.name);
  await expect(row).toContainText(`${testData.taxCode.rate}`);

  await loginPage.logout();
});

// Skipped by default until the feature is ready for testing
test.skip('add new category group', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const settings = new SettingsPage(page);
  await settings.openCategories();
  await settings.addCategoryGroup(testData.categoryGroup.name);

  const successToast = page.locator('.Toastify__toast--success').last();
  await expect(successToast).toBeVisible();
  await successToast.waitFor({ state: 'hidden' });

  const row = settings.findCategoryGroupRow(testData.categoryGroup.name);
  await expect(row).toContainText(testData.categoryGroup.name);

  await loginPage.logout();
});
