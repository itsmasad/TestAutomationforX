/**
 * Page object for petty cash operations.
 */
class PettyCashPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the petty cash section. */
  async open() {
    await this.page.getByRole('link', { name: /petty cash/i }).click();
  }

  /**
   * Add funds to petty cash.
   * @param {string|number} amount - Amount to add.
   * @param {string} description - Transaction description.
   */
  async addCash(amount, description) {
    await this.page.locator('#add_petty_cash').click();
    await this.page.locator('#add_amount_petty_cash').fill(String(amount));
    await this.page.locator('#add_desc_petty_cash').fill(description);
    await this.page.locator('#submit_add_petty_cash').click();
  }

  /**
   * Withdraw funds from petty cash.
   * @param {string|number} amount - Amount to withdraw.
   * @param {string} description - Transaction description.
   */
  async withdrawCash(amount, description) {
    await this.page.locator('#withdraw_petty_cash').click();
    await this.page.locator('#withraw_amount_petty_cash').fill(String(amount));
    await this.page.locator('#withdraw_desc_petty_cash').fill(description);
    await this.page.locator('#submit_withdraw_petty_cash').click();
  }
}

module.exports = { PettyCashPage };
