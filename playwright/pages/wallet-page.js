const logger = require('../logger');
const { LoginPage } = require('./login-page');

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
    // Amount field can be labelled or a generic textbox
    // Prefer exact role-based locator for Amount field in Add Funds flow
    let amountField = this.page.getByRole('textbox', { name: 'Amount', exact: true });
    if (await amountField.count() === 0) {
      amountField = this.page.getByLabel(/amount\s*\*/i);
    }
    if (await amountField.count() === 0) {
      amountField = this.page.getByLabel(/amount/i);
    }
    if (await amountField.count() === 0) {
      amountField = this.page.getByRole('textbox', { name: /amount/i });
    }
    await amountField.first().fill(String(amount));
    logger.log(`Fill reason/narrative with "${narrative}"`);
    let reasonField = this.page.getByLabel(/reason|narrative/i);
    if (await reasonField.count() === 0) {
      reasonField = this.page.getByRole('textbox', { name: /reason|narrative/i });
    }
    await reasonField.first().fill(narrative);

    logger.log('Click Continue on add fund');
    await this.page.getByRole('button', { name: 'Continue' }).click();

    logger.log('Click Confirm on review');
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    // Mobile OTP verification
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const mobileOtp = await LoginPage.fetchMobileOtp(this.page.context());
    const digits = mobileOtp.split('');
    for (let i = 0; i < digits.length; i++) {
      logger.log(`Fill OTP digit ${digits[i]} in position ${i + 1}`);
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    logger.log('Submit OTP to add funds');
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Stop here to allow tests to assert success toast, then finalize navigation.
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
    // Prefer exact role-based locator for Amount field in Withdraw flow as well
    let amountField = this.page.getByRole('textbox', { name: 'Amount', exact: true });
    if (await amountField.count() === 0) {
      amountField = this.page.getByLabel(/amount\s*\*/i);
    }
    if (await amountField.count() === 0) {
      amountField = this.page.getByLabel(/amount/i);
    }
    if (await amountField.count() === 0) {
      amountField = this.page.getByRole('textbox', { name: /amount/i });
    }
    await amountField.first().fill(String(amount));
    logger.log(`Fill reason/narrative with "${narrative}"`);
    let reasonField = this.page.getByLabel(/reason|narrative/i);
    if (await reasonField.count() === 0) {
      reasonField = this.page.getByRole('textbox', { name: /reason|narrative/i });
    }
    await reasonField.first().fill(narrative);

    logger.log('Click Continue on withdraw');
    await this.page.getByRole('button', { name: 'Continue' }).click();

    logger.log('Click Confirm on review');
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    // Mobile OTP verification
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const mobileOtp = await LoginPage.fetchMobileOtp(this.page.context());
    const digits = mobileOtp.split('');
    for (let i = 0; i < digits.length; i++) {
      logger.log(`Fill OTP digit ${digits[i]} in position ${i + 1}`);
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    logger.log('Submit OTP to withdraw funds');
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Stop here to allow tests to assert success toast, then finalize navigation.
  }
}

module.exports = { WalletPage };
