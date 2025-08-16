const logger = require('../logger');

/**
 * Page object for managing tax codes within Settings > Accounting.
 */
class TaxCodesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the Tax Codes section via Settings and Accounting tabs. */
  async open() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();
    logger.log('Open accounting tab');
    await this.page.getByRole('tab', { name: 'Accounting' }).click();
    logger.log('Open tax codes section');
    await this.page.getByRole('tab', { name: 'Tax codes' }).click();
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
}

module.exports = { TaxCodesPage };
