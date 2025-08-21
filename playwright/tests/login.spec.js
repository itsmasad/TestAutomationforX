const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const testData = require('../testdata');

// Use a single login session for both login and logout tests.
test.describe.serial('login flow', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
    await loginPage.login(testData.credentials.email, testData.credentials.password);
  });

  test.afterAll(async () => {
    await context.close();
  });

  // Verify that a user can log into the application
  test('login with OTP', async () => {
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });

  // Ensure that the logout functionality works
  test('logout via icon', async () => {
    await loginPage.logout();
    await expect(page.getByLabel('Email address')).toBeVisible();
  });
});

