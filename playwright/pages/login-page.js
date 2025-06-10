class LoginPage {
  constructor(page, context) {
    this.page = page;
    this.context = context;
  }

  static async fetchEmailOtp(context, inbox) {
    const mail = await context.newPage();
    // wait a bit to allow the message to arrive
    await mail.waitForTimeout(5000);
    await mail.goto(`https://yopmail.com/?${inbox}`);
    const inboxFrame = mail.frameLocator('#ifinbox');
    await inboxFrame.locator('div.m').first().click();
    const mailFrame = mail.frameLocator('#ifmail');
    const body = await mailFrame.locator('body').innerText();
    await mail.close();
    return body.match(/\b(\d{6})\b/)[1];
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email = 'Ryan_Adams1@yopmail.com', password = 'Xpendless@A1') {
    await this.goto();
    await this.page.getByLabel('Email address').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
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
