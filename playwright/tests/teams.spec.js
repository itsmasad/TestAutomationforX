const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { TeamsPage } = require('../pages/teams-page');
const testData = require('../testdata');

// Validate creating multiple departments from the Teams page in a single test
// This test logs in once, adds all departments, verifies success for each, and
// then logs out.

const departmentNames = [
  testData.teams.departmentName,
  'HR',
  'Development',
];

test.skip('create multiple departments via teams plus icon', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(testData.credentials.email, testData.credentials.password);

  const teams = new TeamsPage(page);
  await teams.open();

  for (const name of departmentNames) {
    await teams.addDepartment(name);
    const successToast = page
      .locator('.Toastify__toast--success')
      .filter({ hasText: 'Department created successfully!' })
      .first();
    await successToast.waitFor({ state: 'visible' });
    await expect(successToast).toHaveText('Department created successfully!');
    await expect(page.getByText(name)).toBeVisible();
  }

  await loginPage.logout();
});
