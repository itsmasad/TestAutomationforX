const { expect } = require('@playwright/test');
const testData = require('../testdata');
const logger = require('../logger');

class OdooPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Log into the Odoo instance using provided credentials.
   * @param {string} [username=testData.odoo.username] - Odoo account email.
   * @param {string} [password=testData.odoo.password] - Odoo account password.
   */
  async login(username = testData.odoo.username, password = testData.odoo.password) {
    logger.log(`Log into Odoo with username "${username}"`);
    const emailField = this.page.getByLabel(/email/i);
    const passwordField = this.page.getByLabel(/password/i);
    await emailField.fill(username);
    await passwordField.fill(password);
    // Submit the form and wait for the dashboard to load
    logger.log('Submit Odoo login form');
    await this.page.getByRole('button', { name: /log in/i }).click();
    await this.page.waitForLoadState('load');
    // Ensure the dashboard is fully ready before interacting
    await this.page.getByRole('button', { name: 'KYB' }).waitFor({
      state: 'visible'
    });
    logger.log('Odoo dashboard loaded');
  }

  /** Navigate to the Odoo staging environment. */
  async goto() {
    logger.log('Navigate to Odoo staging environment');
    await this.page.goto(testData.odoo.stagingUrl, { waitUntil: 'domcontentloaded' });
    // Ensure all network activity has settled and the login form is visible
    // await this.page.waitForLoadState('networkidle');
    await this.page.getByLabel(/email/i).waitFor();
    await this.page.getByLabel(/password/i).waitFor();
    await this.page.getByRole('button', { name: /log in/i }).waitFor();
    logger.log('Odoo login form displayed');
  }

  /**
   * Navigate to KYB → My Pipeline and remove any active filters.
   */
  async openKybMyPipelines() {
    logger.log('Open KYB → My Pipeline');
    const kybButton = this.page.getByRole('button', { name: 'KYB' });
    await kybButton.waitFor();
    await kybButton.click();
    const pipelineMenu = this.page.getByRole('menuitem', { name: 'My Pipeline' });
    await pipelineMenu.waitFor();
    await pipelineMenu.click();
    await this.page.waitForTimeout(4000);
    const removeBtn = this.page.getByRole('button', { name: 'Remove' });
    if (await removeBtn.isVisible()) {
      logger.log('Remove active filters');
      await removeBtn.click();
    }
  }

  /**
   * Open the first company entry in the pipeline list.
   */
  async openFirstCompany() {
    logger.log('Open first company from pipeline');
    const firstRow = this.page.locator('tbody tr').first();
    await firstRow.waitFor();
    await firstRow.click();
  }

  /**
   * Verify that the opened company details match expected values.
   * @param {{name?: string, registration?: string, phone?: string, email?: string, address?: string}} expected
   */
  async verifyCompanyDetails(expected) {
    if (expected.name) {
      const nameInput = this.page.locator('#name_0');
      const value = await nameInput.inputValue();
      logger.log(`Verify company name: expected "${expected.name}", actual "${value}"`);
      await expect(nameInput).toHaveValue(expected.name);
    }
    if (expected.registration) {
      const regInput = this.page.getByRole('textbox', { name: 'Reg. No.' });
      const value = await regInput.inputValue();
      logger.log(`Verify registration number: expected "${expected.registration}", actual "${value}"`);
      await expect(regInput).toHaveValue(expected.registration);
    }
    if (expected.phone) {
      const phoneInput = this.page.locator('#phone_2');
      const value = await phoneInput.inputValue();
      logger.log(`Verify phone: expected "${expected.phone}", actual "${value}"`);
      await expect(phoneInput).toHaveValue(expected.phone);
    }
    if (expected.email) {
      const emailInput = this.page.locator('#email_from_2');
      const value = await emailInput.inputValue();
      logger.log(`Verify email: expected "${expected.email}", actual "${value}"`);
      await expect(emailInput).toHaveValue(expected.email);
    }
    if (expected.address) {
      const addressInput = this.page.getByRole('textbox', { name: 'Street...' });
      const value = await addressInput.inputValue();
      logger.log(`Verify address: expected "${expected.address}", actual "${value}"`);
      await expect(addressInput).toHaveValue(expected.address);
    }
  }

  /**
   * Accept the company and then verify it within Odoo.
   * Assumes the company details page is already open.
   */
  async acceptAndVerifyCompany() {
    logger.log('Accept company');
    const acceptButton = this.page.getByRole('button', { name: /accept/i });
    await acceptButton.waitFor();
    await acceptButton.click();

    const okButton = this.page.getByRole('button', { name: /^ok$/i });
    await okButton.waitFor();
    await okButton.click();
    logger.log('Confirmed acceptance');

    // Wait for the confirmation dialog to disappear
    await this.page.waitForTimeout(3000);

    // After accepting, a Verify button appears in the same spot
    const verifyButton = this.page.getByRole('button', { name: /verify/i });
    await verifyButton.waitFor();
    await verifyButton.click();
    logger.log('Verify company');

    await okButton.waitFor();
    await okButton.click();
    logger.log('Confirmed verification');

    // Allow backend processing a little time before continuing
    await this.page.waitForTimeout(5000);
  }
}

module.exports = { OdooPage };
