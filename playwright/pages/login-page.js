const testData = require('../testdata');

/**
 * Page object modelling the login functionality.
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance.
   * @param {import('@playwright/test').BrowserContext} context - Browser context for opening new pages.
   */
  constructor(page, context) {
    this.page = page;
    this.context = context;
  }

  /**
   * Retrieve the one time password from the temporary mailbox.
   * @param {import('@playwright/test').BrowserContext} context - Browser context to use.
   * @param {string} inbox - Name of the yopmail inbox to read from.
   * @returns {Promise<string>} The six digit OTP code found in the email.
   */
  static async fetchEmailOtp(context, inbox) {
    const mail = await context.newPage();
    // Wait briefly to allow the OTP email to arrive
    await mail.waitForTimeout(5000);
    await mail.goto(`https://yopmail.com/?${inbox}`);

    // Open the first message in the inbox and read its body
    const inboxFrame = mail.frameLocator('#ifinbox');
    await inboxFrame.locator('div.m').first().click();
    const mailFrame = mail.frameLocator('#ifmail');
    const body = await mailFrame.locator('body').innerText();
    await mail.close();
    return body.match(/\b(\d{6})\b/)[1];
  }

  /** Navigate to the application's login page. */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Perform the complete login flow using email OTP authentication.
   * @param {string} [email=testData.credentials.email] - User email address.
   * @param {string} [password=testData.credentials.password] - User password.
   */
  async login(email = testData.credentials.email, password = testData.credentials.password) {
    await this.goto();
    await this.page.getByLabel('Email address').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();

    // Wait for the OTP entry fields to appear
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const inbox = email.split('@')[0];
    const otp = await LoginPage.fetchEmailOtp(this.context, inbox);
    const digits = otp.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    await this.page.getByRole('button', { name: 'Login' }).click();
    await this.page.getByRole('link', { name: /dashboard/i }).waitFor();
  }

  /**
   * Log out of the application.
   * Some pages expose the logout link only after opening the user menu.
   */
  async logout() {
    const logoutLink = this.page.getByRole('link', { name: /logout/i });
    if (!(await logoutLink.isVisible())) {
      const userMenu = this.page.getByText(/ryan_adams1/i);
      if (await userMenu.isVisible()) {
        await userMenu.click();
      }
    }
    await this.page.getByLabel('Email address').waitFor();
  }
}

module.exports = { LoginPage };
