const { faker } = require('@faker-js/faker');
const logger = require('../logger');

/**
 * Page object for managing application users.
 */
class UsersPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the Users section. */
  async open() {
    logger.log('Navigate to users section');
    await this.page.getByRole('link', { name: /users/i }).click();
  }

  /**
   * Generate a random number with the given length using faker.
   * @param {number} length
   * @returns {string}
   */
  static randomDigits(length) {
    return faker.number.int({
      min: 10 ** (length - 1),
      max: 10 ** length - 1,
    }).toString();
  }

  /**
   * Add a new user via the Add User form.
   * @param {object} user
   * @param {string} user.firstName
   * @param {string} user.lastName
   * @param {string} user.email
   * @param {string} user.role
   */
  async addUser({ firstName, lastName, email, role }) {
    logger.log('Open add user form');
    await this.page.getByRole('button', { name: /add user/i }).click();

    logger.log(`Fill first name with "${firstName}"`);
    await this.page.getByLabel(/first name/i).fill(firstName);
    logger.log(`Fill last name with "${lastName}"`);
    await this.page.getByLabel(/last name/i).fill(lastName);
    logger.log(`Fill email with "${email}"`);
    await this.page.getByLabel(/email/i).fill(email);

    const mobile = UsersPage.randomDigits(10);
    logger.log(`Fill mobile number with "${mobile}"`);
    await this.page.getByLabel(/mobile number/i).fill(mobile);

    const nationalId = UsersPage.randomDigits(11);
    logger.log(`Fill national ID with "${nationalId}"`);
    await this.page.getByLabel(/national id/i).fill(nationalId);

    logger.log(`Select role ${role}`);
    await this.page.getByLabel(/role/i).selectOption({ label: role });

    logger.log('Submit new user form');
    await this.page.getByRole('button', { name: /create|add|submit/i }).click();
  }
}

module.exports = { UsersPage };
