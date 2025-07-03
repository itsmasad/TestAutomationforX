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
    await this.page.getByLabel(/email/i).fill(username);
    await this.page.getByLabel(/password/i).fill(password);
    await Promise.all([
      // this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      this.page.getByRole('button', { name: /log in/i }).click(),
    ]);
  }

  /** Navigate to the Odoo staging environment. */
  async goto() {
    await this.page.goto(testData.odoo.stagingUrl);
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
}

module.exports = { OdooPage };
