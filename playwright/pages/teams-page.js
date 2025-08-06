const logger = require('../logger');

/**
 * Page object for managing teams and departments.
 */
class TeamsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the Teams section. */
  async open() {
    logger.log('Navigate to teams section');
    await this.page.getByRole('link', { name: /teams/i }).click();
  }

  /**
   * Add a new department via the plus icon.
   * @param {string} name - Department name to create.
   */
  async addDepartment(name) {
    logger.log('Open add department form');
    await this.page.locator('#plus').click();
    logger.log(`Fill department name with "${name}"`);
    await this.page.locator('#departmentName, #depatmentName').fill(name);
    logger.log('Submit new department');
    await this.page.getByRole('button', { name: 'Add' }).click();
  }
}

module.exports = { TeamsPage };
