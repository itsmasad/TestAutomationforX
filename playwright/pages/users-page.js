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
   * Ensure the given role is enabled prior to submitting the form. Some roles
   * are rendered as checkboxes while others use toggle switches without an
   * accessible label, so a few strategies are attempted.
   *
   * @param {string} role - Visible role text (e.g. "Admin", "Accountant").
   */
  async setRole(role) {
    const roleRegex = new RegExp(role, 'i');

    // Try a simple label lookup first which covers standard checkboxes
    const labelledControl = this.page.getByLabel(roleRegex);
    if (await labelledControl.count()) {
      await labelledControl.check({ force: true });
      return;
    }

    // Some roles may be implemented as switches
    const switchControl = this.page.getByRole('switch', { name: roleRegex });
    if (await switchControl.count()) {
      const state = await switchControl.getAttribute('aria-checked');
      if (state !== 'true') {
        await switchControl.click();
      }
      return;
    }

    // Fallback to a role based checkbox
    const checkboxControl = this.page.getByRole('checkbox', { name: roleRegex });
    if (await checkboxControl.count()) {
      await checkboxControl.check({ force: true });
      return;
    }

    // Final fallback: locate text and toggle the nearest switch/checkbox
    const label = this.page.getByText(roleRegex).first();
    if (await label.count()) {
      const toggle = label
        .locator('xpath=./preceding-sibling::*[self::input[@type="checkbox"] or @role="switch"] | ./following-sibling::*[self::input[@type="checkbox"] or @role="switch"]')
        .first();
      if (await toggle.count()) {
        const checked =
          (await toggle.getAttribute('aria-checked')) === 'true' ||
          (await toggle.evaluate(node => node.checked ?? false));
        if (!checked) {
          await toggle.click({ force: true });
        }
      }
    }
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
    await this.setRole(role);

    // Allow any role toggles to take effect before submitting
    await this.page.waitForTimeout(500);

    logger.log('Submit new user form');
    await this.page.getByRole('button', { name: /create|add|submit/i }).click();
  }
}

module.exports = { UsersPage };
