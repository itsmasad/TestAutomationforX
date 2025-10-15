const { LoginPage } = require('./login-page');
const logger = require('../logger');

/**
 * Page object to handle the "Forgot Password" flow.
 */
class ForgotPasswordPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').BrowserContext} context
   */
  constructor(page, context) {
    this.page = page;
    this.context = context;
  }

  /** Generate a new password with the required format: xpendless@A## */
  static generateNewPassword() {
    const twoDigits = Math.floor(Math.random() * 90 + 10); // 10-99
    return `xpendless@A${twoDigits}`;
  }

  /** Fill the OTP widget with a 6-digit code. */
  async fillOtp(otp) {
    for (let i = 0; i < otp.length; i++) {
      await this.page
        .getByRole('textbox', { name: `Please enter OTP character ${i + 1}` })
        .fill(otp[i]);
    }
  }

  /**
   * Complete the full forgot password flow for a given email.
   * Returns the new password that was set.
   * @param {string} email
   * @returns {Promise<string>} new password
   */
  async resetPasswordForEmail(email) {
    logger.log('Navigate to home page');
    await this.page.goto('/');

    logger.log('Click "Forgot Passcode"');
    await this.page.locator('#forgot_password').click();

    logger.log(`Enter email for reset: ${email}`);
    const emailField = this.page.getByLabel(/email/i);
    await emailField.waitFor();
    await emailField.fill(email);

    logger.log('Click Continue');
    await this.page.getByRole('button', { name: /continue|next|submit/i }).click();

    // OTP Verification (Email)
    await this.page
      .getByRole('textbox', { name: 'Please enter OTP character 1' })
      .waitFor();
    const inbox = email.split('@')[0];
    logger.log(`Fetch email OTP from inbox: ${inbox}`);
    const otp = await LoginPage.fetchEmailOtp(this.context, inbox);
    await this.fillOtp(otp);
    await this.page.getByRole('button', { name: /continue|verify|confirm/i }).click();

    // New password + confirmation
    const newPassword = ForgotPasswordPage.generateNewPassword();
    logger.log('Set new password');
    await this.page.locator('input[type="password"]').first().waitFor();
    const pwdInputs = this.page.locator('input[type="password"]');
    const count = await pwdInputs.count();
    if (count >= 2) {
      await pwdInputs.nth(0).fill(newPassword);
      await pwdInputs.nth(1).fill(newPassword);
      await this.page
        .getByRole('button', { name: /continue|next|create|set password|submit|reset/i })
        .click();
    } else {
      await pwdInputs.first().fill(newPassword);
      await this.page
        .getByRole('button', { name: /continue|next|create|set password|submit|reset/i })
        .click();
      const confirmInput = this.page.locator('input[type="password"]').first();
      await confirmInput.waitFor();
      await confirmInput.fill(newPassword);
      await this.page
        .getByRole('button', { name: /continue|next|create|set password|submit|reset/i })
        .click();
    }

    // Expect to return to login screen
    await this.page.getByLabel('Email address').waitFor();
    logger.log('Password reset completed, login form visible');

    return newPassword;
  }
}

module.exports = { ForgotPasswordPage };

