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
    await this.page.pause();
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
    await this.page.getByLabel(/company size/i).selectOption('1-10');
    await this.page.getByLabel(/expected transactions/i).fill('100');
    await this.page.getByRole('button', { name: /next/i }).click();
  }

  /** Upload two verification documents and proceed. */
  async uploadDocuments() {
    const doc1 = path.join(__dirname, '../testdata/doc1.pdf');
    const doc2 = path.join(__dirname, '../testdata/doc2.pdf');
    const inputs = this.page.locator('input[type="file"]');
    await inputs.nth(0).setInputFiles(doc1);
    await inputs.nth(1).setInputFiles(doc2);
    await this.page.getByRole('button', { name: /next/i }).click();
  }

  /** Complete all verification steps. */
  async completeVerification() {
    await this.open();
    await this.fillCompanyDetails();
    // await this.fillUsageDetails();
    // await this.uploadDocuments();
  }
}

module.exports = { CompanyVerificationPage };
