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
   * Select an option from a custom dropdown control using the same
   * resilient approach employed during company registration when choosing
   * usage details. The control is located via its label, the associated
   * listbox is resolved via the `aria-controls` attribute (falling back to
   * the last opened listbox), and the desired option is clicked. If no
   * options are detected, a keyboard fallback is used.
   *
   * @param {RegExp} label - Regex matching the label associated with the dropdown
   * @param {string} option - Visible text of the option to choose
   */
  async selectFromDropdown(label, option) {
    const dropdown = this.page.getByLabel(label);
    const listboxId = await dropdown.getAttribute('aria-controls');

    await dropdown.click();

    // Determine the list of options tied to this dropdown
    let options;
    if (listboxId) {
      options = this.page.locator(`#${listboxId}`).locator('[role="option"]');
    } else {
      options = this.page.locator('[role="listbox"]').last().locator('[role="option"]');
    }

    const count = await options.count();
    if (count === 0) {
      // Some dropdowns only respond to keyboard interaction
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
      return;
    }

    const match = options.filter({ hasText: option }).first();
    if (await match.count()) {
      await match.click();
    } else {
      await options.first().click();
    }

    // Allow UI to update before proceeding
    await this.page.waitForTimeout(500);
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
  * @param {string} [user.mobile] - Optional mobile number. If omitted a random
  *   value between 8 and 9 digits will be generated.
   */
  async addUser({ firstName, lastName, email, role, department = 'Marketing', gender = 'Male', nationality = 'Kenyan', mobile }) {
    logger.log('Open add user form');
    await this.page.getByRole('button', { name: /add user/i }).click();

    logger.log(`Fill first name with "${firstName}"`);
    await this.page.getByLabel(/first name/i).fill(firstName);
    logger.log(`Fill last name with "${lastName}"`);
    await this.page.getByLabel(/last name/i).fill(lastName);
    logger.log(`Fill email with "${email}"`);
    await this.page.getByLabel(/email/i).fill(email);

    const mobileLength = mobile?.length ?? faker.number.int({ min: 8, max: 9 });
    const mobileNumber = mobile ?? UsersPage.randomDigits(mobileLength);
    logger.log(`Fill mobile number with "${mobileNumber}"`);
    await this.page.getByLabel(/mobile number/i).fill(mobileNumber);

    const nationalId = UsersPage.randomDigits(11);
    logger.log(`Fill national ID with "${nationalId}"`);
    await this.page.getByLabel(/national id/i).fill(nationalId);

    logger.log(`Select department ${department}`);
    await this.selectFromDropdown(/department/i, department);

    logger.log(`Select gender ${gender}`);
    await this.selectFromDropdown(/gender/i, gender);

    logger.log(`Select nationality ${nationality}`);
    await this.selectFromDropdown(/nationality/i, nationality);

    logger.log(`Set role ${role}`);
    // The role control may be rendered as a checkbox, switch, or a labelled
    // input. Try common strategies to ensure the role is actually selected.
    const roleRegex = new RegExp(role, 'i');

    // First attempt to check a labelled control (covers standard checkboxes).
    const labelledControl = this.page.getByLabel(roleRegex);
    if (await labelledControl.count()) {
      await labelledControl.check({ force: true });
    } else {
      // Some roles are implemented as toggle switches.
      const switchControl = this.page.getByRole('switch', { name: roleRegex });
      if (await switchControl.count()) {
        await switchControl.click();
      } else {
        // Fallback to a role-based checkbox locator.
        await this.page
          .getByRole('checkbox', { name: roleRegex })
          .check({ force: true });
      }
    }

    logger.log('Submit new user form');
    await this.page.getByRole('button', { name: /create|add|submit/i }).click();
  }
}

module.exports = { UsersPage };
