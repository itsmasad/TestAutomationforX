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
   * Select an option from a custom dropdown that is implemented with
   * non-native elements (e.g. <button> + <li> list).
   * Playwright's selectOption works only on <select> elements, so for
   * these custom widgets we need to click the control and then choose the
   * option manually.
   * @param {RegExp} label - Regex matching the label associated with the dropdown
   * @param {string} option - Visible text of the option to choose
   */
  async selectFromDropdown(label, option) {
    // Open the dropdown by clicking the control associated with the label
    await this.page.getByLabel(label).click();
    // Click the option text
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  /**
   * Add a new user via the Add User form.
   * @param {object} user
   * @param {string} user.firstName
   * @param {string} user.lastName
  * @param {string} user.email
  * @param {string} user.role
  * @param {string} [user.department]
  * @param {string} [user.gender]
  * @param {string} [user.nationality]
   */
  async addUser({ firstName, lastName, email, role, department = 'Marketing', gender = 'Male', nationality = 'Kenyan' }) {
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

    logger.log(`Select department ${department}`);
    await this.selectFromDropdown(/department/i, department);

    logger.log(`Select gender ${gender}`);
    await this.selectFromDropdown(/gender/i, gender);

    logger.log(`Select nationality ${nationality}`);
    await this.selectFromDropdown(/nationality/i, nationality);

    logger.log(`Select role ${role}`);
    await this.selectFromDropdown(/role/i, role);

    logger.log('Submit new user form');
    await this.page.getByRole('button', { name: /create|add|submit/i }).click();
  }
}

module.exports = { UsersPage };
