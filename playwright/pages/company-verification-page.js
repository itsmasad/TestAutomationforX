const path = require('path');
const testData = require('../testdata');
const logger = require('../logger');

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
    logger.log('Navigate to company verification page');
    await this.page.getByRole('link', { name: /company verification/i }).click();
  }

  /** Fill the first step of company details and proceed. */
  async fillCompanyDetails() {
    // Wait for the form fields to be available then populate them
    await this.page.locator('#addressLine1').waitFor();
    // Give the page a moment before typing the address information
    await this.page.waitForTimeout(2000);
    logger.log('Fill address line 1');
    await this.page.locator('#addressLine1').fill(testData.company.addressLine1);
    logger.log('Fill address line 2');
    await this.page.locator('#addressLine2').fill(testData.company.addressLine2);
    logger.log('Fill city');
    await this.page.locator('#city').fill(testData.company.city);
    
    // Use more specific locators as the page contains duplicate ids
    logger.log(`Fill company phone with ${this.phone}`);
    await this.page.locator('input[name="companyPhone"]').fill(this.phone);
    logger.log(`Fill email address with ${testData.company.email}`);
    await this.page.locator('#emailAddress').fill(testData.company.email);
    logger.log(`Fill postal code with ${testData.company.postalCode}`);
    await this.page.locator('input[name="postalCode"]').fill(testData.company.postalCode);
    const next = this.page.getByRole('button', { name: /next/i });
    logger.log('Click next on company details');
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
    logger.log('Click next on usage details');
    await nextButton.click();
  }

  /** Upload two verification documents and proceed. */
  async uploadDocuments() {
    const doc1 = path.join(__dirname, '../testdata/doc1.pdf');
    const doc2 = path.join(__dirname, '../testdata/doc2.pdf');

    // Locate all file inputs on the page. Some environments expose a
    // single multi-file input while others render two separate fields.
    const inputs = this.page.locator("input[type='file']");
    await inputs.first().waitFor({ state: 'attached' });
    const count = await inputs.count();

    if (count === 1) {
      // Use a single input that supports multiple files.
      logger.log('Upload two documents using single input');
      await inputs.first().setInputFiles([doc1, doc2]);
    } else {
      // Fill two individual inputs sequentially.
      logger.log('Upload document 1');
      await inputs.nth(0).setInputFiles(doc1);
      // Wait for the second input to be ready before uploading
      // await inputs.nth(1).waitFor({ state: 'attached' });
      // await inputs.nth(1).setInputFiles(doc2);
    }

    // await this.page.getByRole('button', { name: /next/i }).click();
  }

  /** Complete all verification steps. */
  async completeVerification() {
    await this.open();
    await this.fillCompanyDetails();
    await this.fillUsageDetails();
    logger.log('Pausing before document upload');
    await this.page.pause();
    await this.uploadDocuments();
  }
}

module.exports = { CompanyVerificationPage };