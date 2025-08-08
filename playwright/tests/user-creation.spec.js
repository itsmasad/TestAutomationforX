const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { UsersPage } = require('../pages/users-page');
const { faker } = require('@faker-js/faker');
const testData = require('../testdata');

// Execute user creation for multiple roles
const roles = ['Admin', 'Accountant', 'Card Holder'];
const mobileMap = {
  Admin: UsersPage.randomDigits(9),
  Accountant: UsersPage.randomDigits(8),
  'Card Holder': UsersPage.randomDigits(9),
};

for (const role of roles) {
  test(`create user - ${role}`, async ({ page, context }) => {
    const loginPage = new LoginPage(page, context);
    await loginPage.login(testData.credentials.email, testData.credentials.password);

    const users = new UsersPage(page);
    await users.open();
    await users.addUser({
      firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
      lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
      email: `${faker.string.alpha({ length: 8 }).toLowerCase()}@yopmail.com`,
      role,
      mobile: mobileMap[role],
      department: testData.teams.departmentName,
      gender: 'Male',
      nationality: 'Kenyan',
    });

    await expect(page.locator('.Toastify__toast--success')).toBeVisible();

    await loginPage.logout();
  });
}
