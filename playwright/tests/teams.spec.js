const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { TeamsPage } = require('../pages/teams-page');
const testData = require('../testdata');

// Validate creating new departments from the Teams page
// This suite logs in, opens Teams, adds a department and expects a success toast
// then logs out for each department name.

const departmentNames = [
  testData.teams.departmentName,
  'HR',
  'Development',
];

for (const name of departmentNames) {
  test(`create department via teams plus icon - ${name}`, async ({ page, context }) => {
    const loginPage = new LoginPage(page, context);
    await loginPage.login(testData.credentials.email, testData.credentials.password);

    const teams = new TeamsPage(page);
    await teams.open();
    await teams.addDepartment(name);
    const successToast = page.locator('.Toastify__toast--success');
    await expect(successToast).toBeVisible();
    await expect(successToast).toContainText(/department/i);
    await expect(page.getByText(name)).toBeVisible();

    await loginPage.logout();
  });
}
