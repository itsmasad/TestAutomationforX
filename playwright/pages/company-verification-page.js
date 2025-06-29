const path = require('path');
const testData = require('../testdata');

class CompanyVerificationPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} [phone=testData.company.phone] - Phone number for verification
   */
  constructor(page, phone = testData.company.phone) {
    this.page = page;
    this.phone = phone;
  }

  /** Navigate to the company verification page. */
  async open() {
    await this.page.getByRole('link', { name: /company verification/i }).click();
  }

  /** Fill the first step of company details and proceed. */
  async fillCompanyDetails() {
    // Wait for the form fields to be available then populate them
    await this.page.locator('#addressLine1').waitFor();
    // Give the page a moment before typing the address information
    await this.page.waitForTimeout(2000);
    await this.page.locator('#addressLine1').fill(testData.company.addressLine1);
    await this.page.locator('#addressLine2').fill(testData.company.addressLine2);
    await this.page.locator('#city').fill(testData.company.city);
    
    // Use more specific locators as the page contains duplicate ids
    await this.page.locator('input[name="companyPhone"]').fill(this.phone);
    await this.page.locator('#emailAddress').fill(testData.company.email);
    await this.page.locator('input[name="postalCode"]').fill(testData.company.postalCode);
    const next = this.page.getByRole('button', { name: /next/i });
    await next.click();
  }

  /** Fill usage information step and proceed. */
  async fillUsageDetails() {
    // The usage page contains three drop downs. Select a random option from
    // each to avoid assumptions about the available values.
    const dropdowns = this.page.locator('form select');
    const count = await dropdowns.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const select = dropdowns.nth(i);
      await select.waitFor();
      const options = await select.locator('option').all();
      if (options.length === 0) continue;
      const choice = options[Math.floor(Math.random() * options.length)];
      const value = await choice.getAttribute('value');
      await select.selectOption(value ?? { index: 0 });
    };
    // Some environments may render multiple "Next" buttons. Wait for the
    // visible, enabled one before clicking so that the flow reliably advances.
    const nextButton = this.page.locator('#usage_next');
    await nextButton.click();
  }

  /** Upload two verification documents and proceed. */
  async uploadDocuments() {
    const doc1 = path.join(__dirname, '../testdata/doc1.pdf');
    const doc2 = path.join(__dirname, '../testdata/doc2.pdf');

    // File inputs live under the upload icon elements
    const firstInput = this.page.locator("(//div[@class='upload-icon'])[1]//input[@type='file']");
    const secondInput = this.page.locator("(//div[@class='upload-icon'])[2]//input[@type='file']");

    await firstInput.waitFor();

    // Upload the documents. Prefer two separate fields when available
    if (await secondInput.count()) {
      await firstInput.setInputFiles(doc1, { noWaitAfter: true });
      try {
        await secondInput.waitFor({ state: 'visible', timeout: 5000 });
        await secondInput.setInputFiles(doc2, { noWaitAfter: true });
      } catch {
        // If the second field never appears, fall back to a single input
        await firstInput.setInputFiles([doc1, doc2], { noWaitAfter: true });
      }
    } else {
      // Single input accepting multiple files
      await firstInput.setInputFiles([doc1, doc2], { noWaitAfter: true });
    }

    // Prefer an id-based locator for the next button when present
    const nextById = this.page.locator('#documents_next');
    if (await nextById.count()) {
      await nextById.click();
    } else {
      await this.page.getByRole('button', { name: /next/i }).click();
    }
  }

  /** Complete all verification steps. */
  async completeVerification() {
    await this.open();
    await this.fillCompanyDetails();
    await this.fillUsageDetails();
    await this.uploadDocuments();
  }
}

module.exports = { CompanyVerificationPage };
