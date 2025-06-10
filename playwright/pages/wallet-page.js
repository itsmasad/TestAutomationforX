const testData = require('../testdata');

/**
 * Page object for company wallet operations.
 */
class WalletPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the company wallet section. */
  async open() {
    await this.page.getByRole('link', { name: /company wallet/i }).click();
  }

  /**
   * Add funds to the company wallet.
   * @param {string|number} amount - Amount to add.
   * @param {string} narrative - Transaction narrative.
   */
  async addFunds(amount, narrative) {
    await this.page.getByRole('button', { name: /add funds/i }).click();
    await this.page.getByRole('textbox', { name: /^amount\*$/i }).fill(String(amount));
    await this.page.getByLabel(/narrative/i).fill(narrative);
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.waitForTimeout(3000);
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const digits = testData.otp.mobile.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  }

  /**
   * Withdraw funds from the company wallet.
   * @param {string|number} amount - Amount to withdraw.
   * @param {string} narrative - Transaction narrative.
   */
  async withdrawFunds(amount, narrative) {
    await this.page.getByRole('button', { name: /withdraw/i }).click();
    await this.page.getByRole('textbox', { name: /^amount\*$/i }).fill(String(amount));
    await this.page.getByLabel(/narrative/i).fill(narrative);
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const digits = testData.otp.mobile.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  }
}

module.exports = { WalletPage };
