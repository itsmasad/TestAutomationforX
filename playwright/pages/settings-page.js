const logger = require('../logger');

/**
 * Page object for managing settings under the Accounting section including
 * tax codes and categories.
 */
class SettingsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the Tax Codes section via Settings and Accounting tabs. */
  async openTaxCodes() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();
    logger.log('Open accounting tab');
    await this.page.getByRole('tab', { name: 'Accounting' }).click();
    logger.log('Open tax codes section');
    await this.page.getByRole('tab', { name: 'Tax codes' }).click();
  }

  /** Navigate to the Categories section via Settings and Accounting tabs. */
  async openCategories() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();
    logger.log('Open accounting tab');
    await this.page.getByRole('tab', { name: 'Accounting' }).click();
    logger.log('Open categories section');
    await this.page.getByRole('tab', { name: 'Categories' }).click();
  }

  /**
   * Add a new tax code.
   * @param {string} name - Name of the tax code.
   * @param {string|number} rate - Percentage rate for the tax code.
   */
  async addTaxCode(name, rate) {
    logger.log('Open add tax code form');
    await this.page.getByRole('button', { name: '+ Add new' }).click();
    logger.log(`Fill tax code name with "${name}"`);
    await this.page.getByRole('textbox', { name: 'Name' }).fill(name);
    logger.log(`Fill tax rate with "${rate}"`);
    await this.page.getByRole('textbox', { name: 'Tax rate' }).fill(String(rate));
    logger.log('Submit new tax code');
    await this.page.getByRole('button', { name: 'Add', exact: true }).click();
  }

  /**
   * Locate a tax code row by name.
   * @param {string} name - Tax code name to search for.
   * @returns {import('@playwright/test').Locator} Locator for the row.
   */
  findTaxCodeRow(name) {
    logger.log(`Locate tax code row for "${name}"`);
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
  }

  /**
   * Add a new category group.
   * @param {string} name - Name of the category group.
   */
  async addCategoryGroup(name) {
    logger.log('Open add category form');
    // The selector changed across UI revisions, so fall back to the
    // accessible "Add new" button if the id is missing.
    let addBtn = this.page.locator('#add_new_category');
    if (await addBtn.count() === 0) {
      addBtn = this.page.getByRole('button', { name: /\+\s*add new/i });
    }
    await addBtn.click();

    logger.log('Select category icon');
    // Prefer a dedicated combobox, otherwise fall back to a button labelled
    // "Icon". Selecting the first option is sufficient for the test.
    let iconDropdown = this.page.locator('#category_icon');
    if (await iconDropdown.count() === 0) {
      iconDropdown = this.page.getByRole('combobox', { name: /icon/i });
      if (await iconDropdown.count() === 0) {
        iconDropdown = this.page.getByRole('button', { name: /icon/i });
      }
    }
    await iconDropdown.click();
    // Choose the first available option from the list.
    await this.page.getByRole('option').first().click();

    logger.log(`Fill category name with "${name}"`);
    await this.page.getByRole('textbox', { name: /name/i }).fill(name);

    logger.log('Confirm new category group');
    let confirmBtn = this.page.locator('#confirm_add_group');
    if (await confirmBtn.count() === 0) {
      confirmBtn = this.page.getByRole('button', { name: /^add$/i });
    }
    await confirmBtn.click();
  }

  /**
   * Locate a category group row by name.
   * @param {string} name - Category group name to search for.
   * @returns {import('@playwright/test').Locator} Locator for the row.
   */
  findCategoryGroupRow(name) {
    logger.log(`Locate category group row for "${name}"`);
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
  }
}

module.exports = { SettingsPage };
