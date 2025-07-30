/**
 * Page object for petty cash operations.
 */
const logger = require('../logger');

class PettyCashPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the petty cash section. */
  async open() {
    logger.log('Navigate to petty cash section');
    await this.page.getByRole('link', { name: /petty cash/i }).click();
  }

  /**
   * Add funds to petty cash.
   * @param {string|number} amount - Amount to add.
   * @param {string} description - Transaction description.
   */
  async addCash(amount, description) {
    logger.log('Click add petty cash');
    await this.page.locator('#add_petty_cash').click();
    logger.log(`Fill amount with ${amount}`);
    await this.page.locator('#add_amount_petty_cash').fill(String(amount));
    logger.log(`Fill description with "${description}"`);
    await this.page.locator('#add_desc_petty_cash').fill(description);
    logger.log('Submit add petty cash');
    await this.page.locator('#submit_add_petty_cash').click();
  }

  /**
   * Withdraw funds from petty cash.
   * @param {string|number} amount - Amount to withdraw.
   * @param {string} description - Transaction description.
   */
  async withdrawCash(amount, description) {
    logger.log('Click withdraw petty cash');
    await this.page.locator('#withdraw_petty_cash').click();
    logger.log(`Fill amount with ${amount}`);
    await this.page.locator('#withraw_amount_petty_cash').fill(String(amount));
    logger.log(`Fill description with "${description}"`);
    await this.page.locator('#withdraw_desc_petty_cash').fill(description);
    logger.log('Submit withdraw petty cash');
    await this.page.locator('#submit_withdraw_petty_cash').click();
  }
}

module.exports = { PettyCashPage };
