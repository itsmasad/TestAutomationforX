const { expect } = require('@playwright/test');
const testData = require('../testdata');

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
    const emailField = this.page.getByLabel(/email/i);
    const passwordField = this.page.getByLabel(/password/i);
    await emailField.fill(username);
    await passwordField.fill(password);
    // Submit the form and wait for the dashboard to load
    await this.page.getByRole('button', { name: /log in/i }).click();
    // await this.page.waitForLoadState('networkidle');
    // Ensure the dashboard is fully ready before interacting
    await this.page.getByRole('button', { name: 'KYB' }).waitFor();
  }

  /** Navigate to the Odoo staging environment. */
  async goto() {
    await this.page.goto(testData.odoo.stagingUrl, { waitUntil: 'domcontentloaded' });
    // Ensure all network activity has settled and the login form is visible
    await this.page.waitForLoadState('networkidle');
    await this.page.getByLabel(/email/i).waitFor();
    await this.page.getByLabel(/password/i).waitFor();
    await this.page.getByRole('button', { name: /log in/i }).waitFor();
  }

  /**
   * Navigate to KYB → My Pipeline and remove any active filters.
   */
  async openKybMyPipelines() {
    const kybButton = this.page.getByRole('button', { name: 'KYB' });
    await kybButton.waitFor();
    await kybButton.click();
    const pipelineMenu = this.page.getByRole('menuitem', { name: 'My Pipeline' });
    await pipelineMenu.waitFor();
    await pipelineMenu.click();
    await this.page.waitForTimeout(4000);
    const removeBtn = this.page.getByRole('button', { name: 'Remove' });
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
    }

  }

  /**
   * Open the first company entry in the pipeline list.
   */
  async openFirstCompany() {
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
      console.log('Name:', value);
      await expect(nameInput).toHaveValue(expected.name);
    }
    if (expected.registration) {
      const regInput = this.page.getByRole('textbox', { name: 'Reg. No.' });
      const value = await regInput.inputValue();
      console.log('Reg. No.:', value);
      await expect(regInput).toHaveValue(expected.registration);
    }
    if (expected.phone) {
      const phoneInput = this.page.locator('#phone_2');
      const value = await phoneInput.inputValue();
      console.log('Phone:', value);
      await expect(phoneInput).toHaveValue(expected.phone);
    }
    if (expected.email) {
      const emailInput = this.page.locator('#email_from_2');
      const value = await emailInput.inputValue();
      console.log('Email:', value);
      await expect(emailInput).toHaveValue(expected.email);
    }
    if (expected.address) {
      const addressInput = this.page.getByRole('textbox', { name: 'Street...' });
      const value = await addressInput.inputValue();
      console.log('Address:', value);
      await expect(addressInput).toHaveValue(expected.address);
    }
  }

  /**
   * Accept the company and then verify it within Odoo.
   * Assumes the company details page is already open.
   */
  async acceptAndVerifyCompany() {
    const acceptButton = this.page.getByRole('button', { name: /accept/i });
    await acceptButton.waitFor();
    await acceptButton.click();

    const okButton = this.page.getByRole('button', { name: /^ok$/i });
    await okButton.waitFor();
    await okButton.click();

    // Wait for the confirmation dialog to disappear
    await this.page.waitForTimeout(3000);

    // After accepting, a Verify button appears in the same spot
    const verifyButton = this.page.getByRole('button', { name: /verify/i });
    await verifyButton.waitFor();
    await verifyButton.click();

    await okButton.waitFor();
    await okButton.click();

    // Allow backend processing a little time before continuing
    await this.page.waitForTimeout(5000);
  }
}

module.exports = { OdooPage };
