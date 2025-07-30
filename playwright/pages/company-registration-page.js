const { faker } = require('@faker-js/faker');
const { LoginPage } = require('./login-page');
const testData = require('../testdata');
const logger = require('../logger');

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
    const adminFirst = faker.person.firstName().replace(/[^a-zA-Z]/g, '');
    const adminLast = faker.person.lastName().replace(/[^a-zA-Z]/g, '');
    const email = `${adminFirst.toLowerCase()}${faker.number.int({ min: 100, max: 999 })}@yopmail.com`;
    const companyName = `${adminFirst} Limited ${faker.number.int({ min: 100, max: 999 })}`;
    const mobile = `${Math.floor(100000000 + Math.random() * 900000000)}`;

    // expose generated values for later verification steps
    this.mobile = mobile;
    this.companyName = companyName;
    this.email = email;
    const password = testData.company.password;

    // Begin registration on the landing page
    await this.page.goto('/');
    logger.log('Navigate to landing page');
    logger.log('Click create account for your company');
    await this.page.getByRole('link', { name: /create account for your company/i }).click();

    logger.log(`Fill first name with ${adminFirst}`);
    await this.page.getByLabel(/first name/i).fill(adminFirst);
    logger.log(`Fill last name with ${adminLast}`);
    await this.page.getByLabel(/last name/i).fill(adminLast);
    logger.log(`Fill email with ${email}`);
    await this.page.getByLabel(/email address/i).fill(email);
    logger.log('Click continue');
    await this.page.getByRole('button', { name: /continue/i }).click();

    // Email OTP verification
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const inbox = email.split('@')[0];
    const otpEmail = await LoginPage.fetchEmailOtp(this.context, inbox);
    logger.log(`Fetched email OTP ${otpEmail} from ${inbox}`);
    for (let i = 0; i < otpEmail.length; i++) {
      logger.log(`Fill OTP digit ${otpEmail[i]} in position ${i + 1}`);
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(otpEmail[i]);
    }
    logger.log('Submit email OTP');
    await this.page.getByRole('button', { name: /continue|verify|confirm/i }).click();

    // Mobile number verification
    logger.log(`Fill mobile number with ${mobile}`);
    await this.page.getByLabel(/mobile number/i).fill(mobile);
    logger.log('Click continue after mobile');
    await this.page.getByRole('button', { name: /continue|next/i }).click();

    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    // Mobile OTP is currently static during development
    const digits = testData.otp.mobile.split('');
    for (let i = 0; i < digits.length; i++) {
      logger.log(`Fill mobile OTP digit ${digits[i]} in position ${i + 1}`);
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    logger.log('Submit mobile OTP');
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();

    // Set account password
    const passwordInput = this.page.locator('input[type="password"]');
    await passwordInput.waitFor();
    logger.log('Fill password');
    await passwordInput.fill(password);
    logger.log('Click continue after password');
    await this.page.getByRole('button', { name: /continue|create account/i }).click();

    await passwordInput.waitFor();
    logger.log('Confirm password');
    await passwordInput.fill(password);
    logger.log('Submit create account');
    await this.page.getByRole('button', { name: /continue|create account/i }).click();

    // Fill company details
    await this.page.getByLabel(/company name/i).waitFor();
    logger.log(`Fill company name with ${companyName}`);
    await this.page.getByLabel(/company name/i).fill(companyName);
    const regNo = `${Math.floor(10000000 + Math.random() * 90000000)}`;
    logger.log(`Fill registration number with ${regNo}`);
    await this.page.getByLabel(/registration number/i).fill(regNo);

    // store for later verification in Odoo
    this.registrationNumber = regNo;
    logger.log('Click register company');
    await this.page.getByRole('button', { name: /register/i }).click();

    logger.log('Select subscription plan');
    await this.page.getByRole('button', { name: /select plan|Get Subscription/i }).first().click();
    // await this.page.waitForTimeout(10000);

    // Some flows allow skipping the subscription selection
    const skipButton = this.page.getByText(/^Skip$/i);
    await skipButton.waitFor({ state: 'visible', timeout: 15000 });
    // if (await skipButton.isVisible()) {
    //   await skipButton.click();
    // }
    logger.log('Skip subscription selection');
    await skipButton.click();

    await this.page.getByRole('link', { name: /dashboard/i }).waitFor();
  }
}

module.exports = { CompanyRegistrationPage };
