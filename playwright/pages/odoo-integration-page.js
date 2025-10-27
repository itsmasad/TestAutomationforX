const { expect } = require('@playwright/test');
const logger = require('../logger');

/**
 * Page object for Odoo integration within the app Settings.
 */
class OdooIntegrationPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to Settings > Accounting > Setup and open the Odoo application card.
   */
  async openOdooAppCard() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();

    logger.log('Open Accounting tab');
    await this.page.getByRole('tab', { name: /^accounting$/i }).click();

    logger.log('Open Setup tab');
    // Some UIs render Setup as a nested tab or a button; try common roles
    let setupTab = this.page.getByRole('tab', { name: /^setup$/i });
    if (await setupTab.count() === 0) {
      setupTab = this.page.getByRole('button', { name: /^setup$/i });
    }
    await setupTab.first().click();

    logger.log('Open Odoo application card');
    // Locate a card/region that references Odoo
    let odooCard = this.page
      .locator('[role="region"], .card, .ant-card, [data-testid*="card" i]')
      .filter({ hasText: /odoo/i })
      .first();
    if ((await odooCard.count()) === 0) {
      // Fallback: a direct link or button named Odoo
      const odooBtn = this.page.getByRole('button', { name: /odoo/i }).first();
      if (await odooBtn.count()) {
        await odooBtn.click();
        return;
      }
      const odooLink = this.page.getByRole('link', { name: /odoo/i }).first();
      if (await odooLink.count()) {
        await odooLink.click();
        return;
      }
    }
    await odooCard.click();
  }

  /**
   * If a pre-connection card appears, click Continue to proceed.
   */
  async continueFromIntroCard() {
    logger.log('Handle intro card (Continue) if present');
    const intro = this.page.getByRole('dialog').filter({ hasText: /odoo/i });
    const container = (await intro.count()) > 0 ? intro.first() : this.page;
    const continueBtn = container.getByRole('button', { name: /continue/i });
    if (await continueBtn.count()) {
      await continueBtn.click();
    }
  }

  /**
   * Fill Odoo connection form and submit.
   * @param {{ url: string, database: string, username: string, apiKey: string }} data
   */
  async connect(data) {
    const { url, database, username, apiKey } = data;
    logger.log('Fill Odoo connection details');

    // URL
    let urlField = this.page.getByLabel(/^url$/i);
    if ((await urlField.count()) === 0) {
      urlField = this.page.locator('[placeholder*="URL" i], [name*="url" i], [id*="url" i]');
    }
    await urlField.first().fill(url);

    // Database
    let dbField = this.page.getByLabel(/database/i);
    if ((await dbField.count()) === 0) {
      dbField = this.page.locator('[placeholder*="Database" i], [name*="database" i], [id*="database" i]');
    }
    await dbField.first().fill(database);

    // Username
    let userField = this.page.getByLabel(/username|email/i);
    if ((await userField.count()) === 0) {
      userField = this.page.locator('[placeholder*="Username" i], [placeholder*="Email" i], [name*="user" i], [id*="user" i]');
    }
    await userField.first().fill(username);

    // Password / API Key
    let passField = this.page.getByLabel(/password|api key/i);
    if ((await passField.count()) === 0) {
      passField = this.page.locator('[placeholder*="Password" i], [placeholder*="API Key" i], [name*="password" i], [name*="api" i], [id*="password" i]');
    }
    await passField.first().fill(apiKey);

    logger.log('Click Connect');
    let connectBtn = this.page.getByRole('button', { name: /^connect$/i });
    if ((await connectBtn.count()) === 0) {
      connectBtn = this.page.getByRole('button', { name: /connect/i });
    }
    await connectBtn.first().click();
  }

  /**
   * Verify success message and dismiss the confirmation.
   */
  async confirmSuccess() {
    logger.log('Verify success message and click Okay');
    // Exact expected text (allow trailing spaces)
    const successText = /your integration has been successful\s*/i;

    // Prefer a dialog/alertdialog that contains the exact message
    const successContainer = this.page
      .locator('[role="dialog"], [role="alertdialog"], [role="region"], .Toastify__toast, .ant-message, .ant-notification-notice')
      .filter({ hasText: successText })
      .first();

    // Wait up to 15s for the success container to appear
    await expect(successContainer).toBeVisible({ timeout: 15000 });

    // Try to click an explicit OK/Okay button inside the container
    const okBtn = successContainer.getByRole('button', { name: /^ok(ay)?$/i });
    if (await okBtn.count()) {
      await okBtn.click();
    } else {
      // Broader fallbacks in case the button role/name differs
      const altBtn = successContainer.locator('button:has-text("OK"), button:has-text("Okay"), .ant-btn-primary');
      if (await altBtn.count()) {
        await altBtn.first().click();
      } else {
        // If no button exists (auto-dismiss toast), pause briefly
        await this.page.waitForTimeout(1000);
      }
    }

    // Ensure the post-connect UI becomes available to continue
    await expect(this.companyDropdown.first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Assert that the Odoo integration now shows as Connected on the Odoo card.
   */
  async assertConnected() {
    logger.log('Assert Odoo is connected');
    let odooCard = this.page
      .locator('[role="region"], .card, .ant-card, [data-testid*="card" i]')
      .filter({ hasText: /odoo/i })
      .first();
    if ((await odooCard.count()) === 0) {
      // If card changed, use a broader section containing Odoo
      odooCard = this.page.locator('section, div').filter({ hasText: /odoo/i }).first();
    }
    await expect(odooCard).toBeVisible();
    await expect(odooCard.getByText(/connected/i)).toBeVisible();
  }

  /**
   * Soft check for connection state by verifying either the Company dropdown
   * is visible or the Odoo card shows a Connected status. Returns true/false.
   */
  async isConnectedByCompanyDropdown() {
    const dropdownVisible = await this.companyDropdown.first().isVisible().catch(() => false);
    if (dropdownVisible) {
      logger.log('Company dropdown visible (connected): true');
      return true;
    }
    // Fallback: check card status text
    const connectedOnCard = await this.page
      .locator('[role="region"], .card, .ant-card, [data-testid*="card" i]')
      .filter({ hasText: /odoo/i })
      .getByText(/connected/i)
      .first()
      .isVisible()
      .catch(() => false);
    logger.log(`Connected state (dropdown or card): ${dropdownVisible || connectedOnCard}`);
    return connectedOnCard;
  }

  // ---------- Post-connect dropdown helpers ----------

  /** Return a resilient locator for a dropdown by label-like name. */
  getDropdown(name) {
    const re = new RegExp(name, 'i');
    // Prefer accessible label
    let dd = this.page.getByRole('combobox', { name: re });
    // Some UIs use button role for custom selects
    dd = dd.count ? dd : this.page.getByRole('button', { name: re });
    // Fallbacks by label(), placeholder, id/name attributes
    const fallbacks = this.page.locator(
      `label:has-text("${name}") ~ * [role="combobox"],` +
        `label:has-text("${name}") ~ * [role="button"],` +
        `[placeholder*="${name}" i],` +
        `[id*="${name}" i],` +
        `[name*="${name}" i]`
    );
    return this.page.locator(':is([role="combobox"],[role="button"],input,div,span,select)')
      .filter({ hasText: re })
      .first()
      .or(dd.first())
      .or(fallbacks.first());
  }

  // Updated to use precise IDs provided for the Odoo integration form
  get companyDropdown() { return this.page.locator('#company'); }
  get expenseJournalDropdown() { return this.page.locator('#journal'); }
  get reimbursementJournalDropdown() { return this.page.locator('#reimbursementJournal'); }
  get paymentAccountDropdown() { return this.page.locator('#paymentAccount'); }

  /**
   * Soft-check visibility of all dropdowns. Returns true if all visible.
   * If any is missing, returns false (caller should abort test).
   */
  async ensurePostConnectDropdownsVisible() {
    const pairs = [
      ['Company', this.companyDropdown],
      ['Expense Journal', this.expenseJournalDropdown],
      ['Reimbursement Journal', this.reimbursementJournalDropdown],
      ['Payment Account', this.paymentAccountDropdown],
    ];
    const results = [];
    for (const [name, loc] of pairs) {
      const visible = await loc.first().isVisible().catch(() => false);
      logger.log(`${name} dropdown visible: ${visible}`);
      results.push({ name, visible });
    }
    const allVisible = results.every(r => r.visible);
    if (!allVisible) {
      const missing = results.filter(r => !r.visible).map(r => r.name).join(', ');
      logger.log(`Missing dropdowns after connect: ${missing}`);
    }
    return allVisible;
  }

  /** Click dropdown, choose option via ArrowDown + Enter, then wait 3s. */
  async selectFirstOptionFromDropdown(dropdown) {
    await dropdown.first().click();
    await this.page.waitForTimeout(400);
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(3000); // page refreshes after each selection
  }

  async selectCompanyFirstOption() {
    logger.log('Select Company (first option)');
    await this.selectFirstOptionFromDropdown(this.companyDropdown);
  }

  async selectExpenseJournalFirstOption() {
    logger.log('Select Expense Journal (first option)');
    await this.selectFirstOptionFromDropdown(this.expenseJournalDropdown);
  }

  async selectReimbursementJournalFirstOption() {
    logger.log('Select Reimbursement Journal (first option)');
    await this.selectFirstOptionFromDropdown(this.reimbursementJournalDropdown);
  }

  async selectPaymentAccountFirstOption() {
    logger.log('Select Payment Account (first option)');
    await this.selectFirstOptionFromDropdown(this.paymentAccountDropdown);
  }
}

module.exports = { OdooIntegrationPage };
