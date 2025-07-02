const testData = require('../testdata');

class OdooPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the Odoo staging environment. */
  async goto() {
    await this.page.goto(testData.odoo.stagingUrl);
  }

  /** Open the KYB section and select My pipelines. */
  async openKybMyPipelines() {
    await this.page.getByRole('link', { name: /kyb/i }).click();
    await this.page.getByRole('link', { name: /my pipelines/i }).click();
  }
}

module.exports = { OdooPage };
