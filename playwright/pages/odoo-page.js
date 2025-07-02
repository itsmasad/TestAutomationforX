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
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      this.page.getByRole('button', { name: /log in/i }).click(),
    ]);
  }

  /** Navigate to the Odoo staging environment. */
  async goto() {
    await this.page.goto(testData.odoo.stagingUrl);
  }

  /** Open the KYB section and select My pipelines. */
  async openKybMyPipelines() {
    const kybLink = this.page.getByRole('link', { name: /kyb/i });
    await kybLink.waitFor();
    await kybLink.click();

    const pipelineLink = this.page.getByRole('link', { name: /my pipelines/i });
    await pipelineLink.waitFor();
    await pipelineLink.click();
  }
}

module.exports = { OdooPage };
