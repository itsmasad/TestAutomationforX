const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { UsersPage } = require('../pages/users-page');
const { faker } = require('@faker-js/faker');
const testData = require('../testdata');

// Execute user creation for multiple roles within a single test
const roles = ['Admin', 'Accountant', 'Card Holder'];
const emailPrefix = { Admin: 'admin', Accountant: 'acc', 'Card Holder': 'card' };
const mobileMap = {
  Admin: UsersPage.randomDigits(9),
  Accountant: UsersPage.randomDigits(8),
  'Card Holder': UsersPage.randomDigits(9),
};
const nameMap = {
  Admin: { first: 'Admin', last: 'Account' },
  Accountant: { first: 'Accountant', last: 'Account' },
  'Card Holder': { first: 'Card', last: 'Holder' },
};

test.only('create users for all roles', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(
    testData.credentials.email,
    testData.credentials.password
  );

  const users = new UsersPage(page);
  await users.open();

  for (const role of roles) {
    // Build email using company name (excluding "Limited") and the same 3-digit suffix
    const companyName = testData.companyMeta.name || '';
    const suffix = testData.companyMeta.suffix || ((testData.credentials.email || '').match(/(\d{3})$/) || [,''])[1] || '';
    const baseNoLimited = companyName.replace(/\bLimited\b/ig, '').trim();
    const companyKey = `${baseNoLimited.replace(/[^a-zA-Z0-9]/g, '')}${suffix}`.toLowerCase();
    const emailLocal = `${emailPrefix[role]}${companyKey}`;
    await users.addUser({
      firstName: nameMap[role].first,
      lastName: nameMap[role].last,
      email: `${emailLocal}@yopmail.com`,
      role,
      mobile: mobileMap[role],
      department: testData.teams.departmentName,
      gender: 'Male',
      nationality: 'Kenyan',
    });

    const successToast = page.locator('.Toastify__toast--success');
    await expect(successToast).toBeVisible();
    // Ensure toast is dismissed before the next iteration
    await successToast.waitFor({ state: 'hidden' });

    // Persist role email for later invite process; password will be set during invite
    const roleKey = role.replace(/\s+/g, '') === 'CardHolder' ? 'Cardholder' : role;
    testData.updateRoleCredentials(roleKey, `${emailLocal}@yopmail.com`);
  }

  await loginPage.logout();
});
