class WalletPage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.getByRole('link', { name: /company wallet/i }).click();
  }

  async addFunds(amount, narrative) {
    await this.page.getByRole('button', { name: /add funds/i }).click();
    await this.page.getByRole('textbox', { name: /^amount\*$/i }).fill(String(amount));
    await this.page.getByLabel(/narrative/i).fill(narrative);
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.waitForTimeout(3000);
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const digits = '123456'.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  }

  async withdrawFunds(amount, narrative) {
    await this.page.getByRole('button', { name: /withdraw/i }).click();
    await this.page.getByRole('textbox', { name: /^amount\*$/i }).fill(String(amount));
    await this.page.getByLabel(/narrative/i).fill(narrative);
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
    const digits = '123456'.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
    await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  }
}

module.exports = { WalletPage };
