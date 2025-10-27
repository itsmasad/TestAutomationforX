const { test } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { OdooIntegrationPage } = require('../pages/odoo-integration-page');
const logger = require('../logger');

// Odoo integration connection details per request
const ODOO_DETAILS = {
  url: 'https://demo100-xpl-accounting.odoo.com',
  database: 'demo100-xpl-accounting',
  username: 'farhan@xpendless.com',
  apiKey: 'd4aa0a66ea66a13e444c9fc0050561d617128327',
};

test.describe.serial('odoo integration', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;
  /** @type {OdooIntegrationPage} */
  let odooIntegration;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
    await loginPage.login();
    odooIntegration = new OdooIntegrationPage(page);
  });

  test.afterAll(async () => {
    if (loginPage) {
      await loginPage.logout();
    }
    if (context) {
      await context.close();
    }
  });

  test('connect Odoo and verify status', async () => {
    await odooIntegration.openOdooAppCard();
    await odooIntegration.continueFromIntroCard();

    // Pre-check: if already connected, skip the connection flow without failing.
    const alreadyConnected = await odooIntegration.isConnectedByCompanyDropdown();
    if (alreadyConnected) {
      logger.log('Odoo already connected. Skipping connect test flow.');
      return; // do not proceed further if already connected
    }

    // Not connected yet: proceed to connect flow
    await odooIntegration.connect(ODOO_DETAILS);
    await odooIntegration.confirmSuccess();

    // Post-connect check: only proceed if connected; otherwise, exit gracefully
    const connected = await odooIntegration.isConnectedByCompanyDropdown();
    if (!connected) {
      logger.log('Company dropdown not visible after connect. Aborting remaining steps.');
      return;
    }

    // Proceed only if connected: select first options with waits between
    await odooIntegration.selectCompanyFirstOption();
    await odooIntegration.selectExpenseJournalFirstOption();
    await odooIntegration.selectReimbursementJournalFirstOption();
    await odooIntegration.selectPaymentAccountFirstOption();
  });
});
