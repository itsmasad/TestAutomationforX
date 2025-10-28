const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { InviteProcessPage } = require('../pages/invite-process-page');

// Role definitions with names used during user creation
const roles = [
  { key: 'Admin', first: 'Admin', last: 'Account', prefix: 'admin' },
  { key: 'Accountant', first: 'Accountant', last: 'Account', prefix: 'acc' },
  { key: 'Cardholder', first: 'Card', last: 'Holder', prefix: 'card' },
];

test.describe.serial('Complete invite process for role users', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;
  /** @type {InviteProcessPage} */
  let invite;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
    invite = new InviteProcessPage(page, context);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.only('invite acceptance and onboarding for Admin, Accountant, Cardholder', async () => {
    for (const def of roles) {
      await invite.completeInviteForRole(def);
      await loginPage.logout();
    }
  });
});
