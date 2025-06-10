class PettyCashPage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.getByRole('link', { name: /petty cash/i }).click();
  }

  async addCash(amount, description) {
    await this.page.locator('#add_petty_cash').click();
    await this.page.locator('#add_amount_petty_cash').fill(String(amount));
    await this.page.locator('#add_desc_petty_cash').fill(description);
    await this.page.locator('#submit_add_petty_cash').click();
  }

  async withdrawCash(amount, description) {
    await this.page.locator('#withdraw_petty_cash').click();
    await this.page.locator('#withraw_amount_petty_cash').fill(String(amount));
    await this.page.locator('#withdraw_desc_petty_cash').fill(description);
    await this.page.locator('#submit_withdraw_petty_cash').click();
  }
}

module.exports = { PettyCashPage };
