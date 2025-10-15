const logger = require('../logger');

/**
 * Page object for managing settings under the Accounting section including
 * tax codes and categories.
 */
class SettingsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the Tax Codes section via Settings and Accounting tabs. */
  async openTaxCodes() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();
    logger.log('Open accounting tab');
    await this.page.getByRole('tab', { name: 'Accounting' }).click();
    logger.log('Open tax codes section');
    await this.page.getByRole('tab', { name: 'Tax codes' }).click();
  }

  /** Navigate to the Categories section via Settings and Accounting tabs. */
  async openCategories() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();
    logger.log('Open accounting tab');
    await this.page.getByRole('tab', { name: 'Accounting' }).click();
    logger.log('Open categories section');
    await this.page.getByRole('tab', { name: 'Categories' }).click();
  }

  /** Navigate to the Payment Methods section on Settings. */
  async openPaymentMethods() {
    logger.log('Navigate to settings');
    await this.page.getByRole('link', { name: /settings/i }).click();
    logger.log('Open payment methods tab');
    // Some builds may label this tab slightly differently (e.g., "Payments").
    let tab = this.page.getByRole('tab', { name: /payment methods/i });
    if (await tab.count() === 0) {
      tab = this.page.getByRole('tab', { name: /payments/i });
    }
    await tab.click();
  }

  /**
   * Add a new bank account payment method.
   * @param {string} bankName - Visible bank option (e.g., 'Qatar National Bank (QNB)').
   * @param {string} accountName - Account name to save.
   * @param {string} swift - SWIFT/BIC code.
   * @param {string} iban - IBAN value.
   * @param {string} address - Address string.
   */
  async addBankAccount(bankName, accountName, swift, iban, address) {
    logger.log('Open Add Bank Account form');
    // Primary text: "Add Bank Account"; fall back to generic add button
    let addBtn = this.page.getByRole('button', { name: /add bank account/i });
    if (await addBtn.count() === 0) {
      addBtn = this.page.getByRole('button', { name: /\+\s*add new|add/i });
    }
    await addBtn.first().click();

    // Wait for the add dialog/card to appear and scope interactions inside it
    let dialog = this.page.getByRole('dialog').filter({ hasText: /bank account|payment method/i });
    if (await dialog.count() === 0) {
      // Some UIs render a card instead of a dialog; fall back to a section region
      dialog = this.page.getByRole('region').filter({ hasText: /bank account|payment method|add/i });
    }
    const container = (await dialog.count()) > 0 ? dialog.first() : this.page;

    // Select Bank via keyboard (Arrow + Enter), using provided locator id="bankId"
    logger.log(`Select bank "${bankName}" via keyboard`);
    let bankDropdown = container.locator('#bankId');
    if (await bankDropdown.count() === 0) {
      // Fallbacks if id changes
      bankDropdown = container.getByRole('combobox', { name: /bank/i });
      if (await bankDropdown.count() === 0) {
        bankDropdown = container.getByRole('button', { name: /bank/i });
      }
      if (await bankDropdown.count() === 0) {
        bankDropdown = container.getByLabel(/bank/i);
      }
      if (await bankDropdown.count() === 0) {
        bankDropdown = container.locator('[id*="bank" i], [name*="bank" i], [placeholder*="bank" i]');
      }
    }
    await bankDropdown.first().click();
    // If the dropdown supports type-to-filter, type the bank name first
    await this.page.keyboard.type(bankName);
    await this.page.waitForTimeout(500);
    // Move to the first matching option and confirm
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // Fill fields
    logger.log(`Fill account name with "${accountName}"`);
    // Account Name id="accountName"
    let accountNameField = container.locator('#accountName');
    if (await accountNameField.count() === 0) {
      accountNameField = container.getByRole('textbox', { name: /account name/i });
    }
    await accountNameField.first().fill(accountName);
    logger.log(`Fill swift with "${swift}"`);
    // Swift Code id="swiftCode"
    let swiftField = container.locator('#swiftCode');
    if (await swiftField.count() === 0) {
      swiftField = container.getByRole('textbox', { name: /swift code|swift/i });
    }
    await swiftField.first().fill(swift);
    logger.log(`Fill IBAN with "${iban}"`);
    // IBAN name="IBAN"
    let ibanField = container.locator('[name="IBAN"]');
    if (await ibanField.count() === 0) {
      ibanField = container.getByRole('textbox', { name: /iban/i });
    }
    await ibanField.first().fill(iban);
    logger.log('Fill address');
    // Address name="address"
    let addressField = container.locator('[name="address"]');
    if (await addressField.count() === 0) {
      addressField = container.getByRole('textbox', { name: /address/i });
      if (await addressField.count() === 0) {
        addressField = container.getByLabel(/address/i);
      }
    }
    await addressField.first().fill(address);

    // Submit
    logger.log('Submit new bank account');
    // Submit button id="add_account"
    let submitBtn = container.locator('#add_account');
    if (await submitBtn.count() === 0) {
      submitBtn = container.getByRole('button', { name: /^add$/i });
      if (await submitBtn.count() === 0) {
        submitBtn = container.getByRole('button', { name: /save|submit/i });
      }
    }
    await submitBtn.first().click();
  }

  /**
   * Add a new tax code.
   * @param {string} name - Name of the tax code.
   * @param {string|number} rate - Percentage rate for the tax code.
   */
  async addTaxCode(name, rate) {
    logger.log('Open add tax code form');
    await this.page.getByRole('button', { name: '+ Add new' }).click();
    logger.log(`Fill tax code name with "${name}"`);
    await this.page.getByRole('textbox', { name: 'Name' }).fill(name);
    logger.log(`Fill tax rate with "${rate}"`);
    await this.page.getByRole('textbox', { name: 'Enter rate' }).fill(String(rate));
    logger.log('Submit new tax code');
    await this.page.getByRole('button', { name: 'Add', exact: true }).click();
  }

  /**
   * Locate a tax code row by name.
   * @param {string} name - Tax code name to search for.
   * @returns {import('@playwright/test').Locator} Locator for the row.
   */
  findTaxCodeRow(name) {
    logger.log(`Locate tax code row for "${name}"`);
    return this.page.getByRole('row', { name: new RegExp(name, 'i') });
  }

  /**
   * Add a new category group.
   * @param {string} name - Name of the category group.
   */
  async addCategoryGroup(name) {
    logger.log('Open add category form');
    // The selector changed across UI revisions, so fall back to the
    // accessible "Add new" button if the id is missing.
    let addBtn = this.page.locator('#add_new_category');
    if (await addBtn.count() === 0) {
      addBtn = this.page.getByRole('button', { name: /\+\s*add new/i });
    }
    await addBtn.click();

    logger.log('Select category icon');
    // The icon picker has gone through multiple implementations. Try common
    // selectors in order of priority and fall back to a generic label lookup.
    let iconDropdown = this.page.locator('#category_icon');
    if (await iconDropdown.count() === 0) {
      iconDropdown = this.page.locator('#selectIcon');
    }
    if (await iconDropdown.count() === 0) {
      iconDropdown = this.page.getByRole('combobox', { name: /icon/i });
      if (await iconDropdown.count() === 0) {
        iconDropdown = this.page.getByRole('button', { name: /icon/i });
        if (await iconDropdown.count() === 0) {
          iconDropdown = this.page.getByLabel(/icon/i);
        }
      }
    }
    await iconDropdown.click();
    // Choose the first available option from the list.
    await this.page.getByRole('option').first().click();

    logger.log(`Fill category name with "${name}"`);
    await this.page.getByRole('textbox', { name: /name/i }).fill(name);

    logger.log('Confirm new category group');
    let confirmBtn = this.page.locator('#confirm_add_group');
    if (await confirmBtn.count() === 0) {
      confirmBtn = this.page.getByRole('button', { name: /^add$/i });
    }
    await confirmBtn.click();
  }

  /**
   * Locate a category group row by name.
   * @param {string} name - Category group name to search for.
   * @returns {import('@playwright/test').Locator} Locator for the row.
   */
  findCategoryGroupRow(name) {
    logger.log(`Locate category group row for "${name}"`);
    const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'i');
    // Be tolerant of different renderers: tables, lists, generic rows
    return this.page
      .locator('[role="row"], [role="listitem"], tr, li, .table-row, .list-item, [data-testid*="row" i]')
      .filter({ hasText: re })
      .first();
  }
}

module.exports = { SettingsPage };
