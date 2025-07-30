const testData = require('../testdata');
const logger = require('../logger');

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
    logger.log('Navigate to company wallet section');
    await this.page.getByRole('link', { name: /company wallet/i }).click();
  }

  /**
   * Add funds to the company wallet.
   * @param {string|number} amount - Amount to add.
   * @param {string} narrative - Transaction narrative.
   */
  async addFunds(amount, narrative) {
    logger.log('Click add funds');
    await this.page.getByRole('button', { name: /add funds/i }).click();
    logger.log(`Fill amount with ${amount}`);
    await this.page.getByRole('textbox', { name: /^amount\*$/i }).fill(String(amount));
    logger.log(`Fill narrative with "${narrative}"`);
    await this.page.getByLabel(/narrative/i).fill(narrative);
    logger.log('Submit add funds');
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.waitForTimeout(3000);
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const digits = testData.otp.mobile.split('');
    for (let i = 0; i < digits.length; i++) {
      logger.log(`Fill OTP digit ${digits[i]} in position ${i + 1}`);
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    logger.log('Submit OTP to add funds');
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  }

  /**
   * Withdraw funds from the company wallet.
   * @param {string|number} amount - Amount to withdraw.
   * @param {string} narrative - Transaction narrative.
   */
  async withdrawFunds(amount, narrative) {
    logger.log('Click withdraw funds');
    await this.page.getByRole('button', { name: /withdraw/i }).click();
    logger.log(`Fill amount with ${amount}`);
    await this.page.getByRole('textbox', { name: /^amount\*$/i }).fill(String(amount));
    logger.log(`Fill narrative with "${narrative}"`);
    await this.page.getByLabel(/narrative/i).fill(narrative);
    logger.log('Submit withdraw funds');
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const digits = testData.otp.mobile.split('');
    for (let i = 0; i < digits.length; i++) {
      logger.log(`Fill OTP digit ${digits[i]} in position ${i + 1}`);
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    logger.log('Submit OTP to withdraw funds');
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  }
}

module.exports = { WalletPage };
