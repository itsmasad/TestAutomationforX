const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { SettingsPage } = require('../pages/settings-page');
const testData = require('../testdata');

test('add new tax code and category group in one session', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const settings = new SettingsPage(page);

  // Add tax code
  await settings.openTaxCodes();
  await settings.addTaxCode(testData.taxCode.name, testData.taxCode.rate);
  const taxToast = page.locator('.Toastify__toast--success').last();
  await expect(taxToast).toBeVisible();
  await taxToast.waitFor({ state: 'hidden' });
  const taxRow = settings.findTaxCodeRow(testData.taxCode.name);
  await expect(taxRow).toContainText(testData.taxCode.name);
  await expect(taxRow).toContainText(`${testData.taxCode.rate}`);

  // Add category group using the same session
  await settings.openCategories();
  await settings.addCategoryGroup(testData.categoryGroup.name);
  const groupToast = page.locator('.Toastify__toast--success').last();
  await expect(groupToast).toBeVisible();
  await groupToast.waitFor({ state: 'hidden' });
  const groupRow = settings.findCategoryGroupRow(testData.categoryGroup.name);
  await expect(groupRow).toContainText(testData.categoryGroup.name);

  await loginPage.logout();
});
