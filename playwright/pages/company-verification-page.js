const path = require('path');
const { faker } = require('@faker-js/faker');

class CompanyVerificationPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the company verification page. */
  async open() {
    await this.page.getByRole('link', { name: /company verification/i }).click();
  }

  /** Fill the first step of company details and proceed. */
  async fillCompanyDetails() {
    await this.page.getByLabel(/company address/i).fill('123 Verification St');
    await this.page.getByLabel(/city/i).fill('Nairobi');
    await this.page.getByLabel(/country/i).selectOption('KE');
    await this.page.getByRole('button', { name: /next/i }).click();
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
    await this.fillUsageDetails();
    await this.uploadDocuments();
  }
}

module.exports = { CompanyVerificationPage };
