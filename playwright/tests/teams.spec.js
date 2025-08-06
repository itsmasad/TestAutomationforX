const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { TeamsPage } = require('../pages/teams-page');
const testData = require('../testdata');

// Validate creating a new department from the Teams page
// This test logs in, opens Teams, adds a department and expects a success toast
// then logs out.
test('create department via teams plus icon', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const teams = new TeamsPage(page);
  await teams.open();
  await teams.addDepartment(testData.teams.departmentName);
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await loginPage.logout();
});
