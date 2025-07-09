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
    await Promise.all([
      // this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      this.page.getByRole('button', { name: /log in/i }).click(),
    ]);
  }

  /** Navigate to the Odoo staging environment. */
  async goto() {
    await this.page.goto(testData.odoo.stagingUrl);
    // Wait for the login fields to appear as the page can take a moment to load
    await this.page.getByLabel(/email/i).waitFor();
    await this.page.getByLabel(/password/i).waitFor();
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
   * @param {{name?: string, registration?: string, phone?: string, email?: string}} expected
   */
  async verifyCompanyDetails(expected) {
    if (expected.name) {
      const nameInput = this.page.locator('#name_0');
      await expect(nameInput).toHaveValue(expected.name);
    }
    if (expected.registration) {
      const regInput = this.page.getByLabel(/registration number/i);
      await expect(regInput).toHaveValue(expected.registration);
    }
    if (expected.phone) {
      const phoneInput = this.page.getByLabel(/phone/i);
      await expect(phoneInput).toHaveValue(expected.phone);
    }
    if (expected.email) {
      const emailInput = this.page.getByLabel(/email/i);
      await expect(emailInput).toHaveValue(expected.email);
    }
  }
}

module.exports = { OdooPage };
