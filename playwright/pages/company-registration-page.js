const { faker } = require('@faker-js/faker');
const { LoginPage } = require('./login-page');
const testData = require('../testdata');

/**
 * Page object representing the company registration workflow.
 */
class CompanyRegistrationPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').BrowserContext} context
   */
  constructor(page, context) {
    this.page = page;
    this.context = context;
  }

  /**
   * Complete the full company registration flow.
   */
  async registerCompany() {
    // Generate basic details for the administrator and company
    const adminFirst = faker.person.firstName();
    const adminLast = faker.person.lastName();
    const email = `${adminFirst.toLowerCase()}${faker.number.int({ min: 100, max: 999 })}@yopmail.com`;
    const companyName = `${adminFirst} Limited ${faker.number.int({ min: 100, max: 999 })}`;
    const mobile = `${Math.floor(100000000 + Math.random() * 900000000)}`;
    const password = testData.company.password;

    // Begin registration on the landing page
    await this.page.goto('/');
    await this.page.getByRole('link', { name: /create account for your company/i }).click();

    await this.page.getByLabel(/first name/i).fill(adminFirst);
    await this.page.getByLabel(/last name/i).fill(adminLast);
    await this.page.getByLabel(/email address/i).fill(email);
    await this.page.getByRole('button', { name: /continue/i }).click();

    // Email OTP verification
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const inbox = email.split('@')[0];
    const otpEmail = await LoginPage.fetchEmailOtp(this.context, inbox);
    for (let i = 0; i < otpEmail.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(otpEmail[i]);
    }
    await this.page.getByRole('button', { name: /continue|verify|confirm/i }).click();

    // Mobile number verification
    await this.page.getByLabel(/mobile number/i).fill(mobile);
    await this.page.getByRole('button', { name: /continue|next/i }).click();

    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    // Mobile OTP is currently static during development
    const digits = testData.otp.mobile.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();

    // Set account password
    const passwordInput = this.page.locator('input[type="password"]');
    await passwordInput.waitFor();
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: /continue|create account/i }).click();

    await passwordInput.waitFor();
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: /continue|create account/i }).click();

    // Fill company details
    await this.page.getByLabel(/company name/i).waitFor();
    await this.page.getByLabel(/company name/i).fill(companyName);
    const regNo = `${Math.floor(10000000 + Math.random() * 90000000)}`;
    await this.page.getByLabel(/registration number/i).fill(regNo);
    await this.page.getByRole('button', { name: /register/i }).click();

    await this.page.getByRole('button', { name: /select plan|Get Subscription/i }).first().click();
    // await this.page.waitForTimeout(10000);

    // Some flows allow skipping the subscription selection
    const skipButton = this.page.getByText(/^Skip$/i);
    // await skipButton.waitFor({ state: 'visible', timeout: 15000 });
    // if (await skipButton.isVisible()) {
    //   await skipButton.click();
    // }
    await skipButton.click();

    await this.page.getByRole('link', { name: /dashboard/i }).waitFor();
  }
}

module.exports = { CompanyRegistrationPage };
