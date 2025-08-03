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
    // Focus on the form that is titled "Provide usage details" so we don't
    // accidentally interact with unrelated dropdowns elsewhere on the page.
    const usageForm = this.page.locator('form').filter({
      hasText: /provide usage details/i,
    });
    await usageForm.waitFor();

    // The component historically used <select> elements. If those exist,
    // iterate through each one (there are currently three) and choose the
    // first valid option. Should the UI switch to tab-style selectors again,
    // fall back to clicking the first tab in each tablist within the form.
    const dropdowns = usageForm.locator('select');
    const dropdownCount = await dropdowns.count();

    if (dropdownCount > 0) {
      for (let i = 0; i < dropdownCount; i++) {
        const select = dropdowns.nth(i);
        await select.waitFor();
        const value = await select.evaluate((el) => {
          const option = Array.from(el.options).find(
            (o) => !o.disabled && o.value && o.value.trim() !== ''
          );
          return option ? option.value : null;
        });
        if (value) {
          await select.selectOption(value);
        } else {
          const optionCount = await select.locator('option').count();
          const index = optionCount > 1 ? 1 : 0;
          await select.selectOption({ index });
        }
      }
    } else {
      const tablists = usageForm.locator('[role="tablist"]');
      const listCount = await tablists.count();
      for (let i = 0; i < listCount; i++) {
        const tabs = tablists.nth(i).locator('[role="tab"]');
        if (await tabs.count() === 0) continue;
        await tabs.nth(0).click();
      }
    }

    // Click the "Next" button associated with the usage form. The button id
    // varies between environments, so attempt a specific id first and then
    // fall back to a role-based locator within the same form.
    let nextButton = usageForm.locator('#usage_next');
    if (await nextButton.count() === 0) {
      nextButton = usageForm.getByRole('button', { name: /next/i });
    }
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
