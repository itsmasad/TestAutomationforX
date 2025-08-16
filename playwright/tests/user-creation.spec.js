const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { UsersPage } = require('../pages/users-page');
const { faker } = require('@faker-js/faker');
const testData = require('../testdata');

// Execute user creation for multiple roles within a single test
const roles = ['Admin', 'Accountant', 'Card Holder'];
const mobileMap = {
  Admin: UsersPage.randomDigits(9),
  Accountant: UsersPage.randomDigits(8),
  'Card Holder': UsersPage.randomDigits(9),
};
const lastNameMap = {
  Admin: 'Admin',
  Accountant: 'Accountant',
  'Card Holder': 'Card Holder',
};

test.skip('create users for all roles', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  await loginPage.login(
    testData.credentials.email,
    testData.credentials.password
  );

  const users = new UsersPage(page);
  await users.open();

  for (const role of roles) {
    await users.addUser({
      firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
      // Last name must correspond to the selected role
      lastName: lastNameMap[role],
      email: `${faker.string.alpha({ length: 8 }).toLowerCase()}@yopmail.com`,
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
  }

  await loginPage.logout();
});
