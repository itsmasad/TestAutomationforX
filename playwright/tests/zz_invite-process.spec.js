const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const testData = require('../testdata');

// Role definitions with names used during user creation
const roles = [
  { key: 'Admin', first: 'Admin', last: 'Account', prefix: 'admin' },
  { key: 'Accountant', first: 'Accountant', last: 'Account', prefix: 'acc' },
  { key: 'Cardholder', first: 'Card', last: 'Holder', prefix: 'card' },
];

function roleEmail(roleDef) {
  // Prefer persisted role email; otherwise reconstruct from company meta
  const saved = testData.roles[roleDef.key]?.email;
  if (saved) return saved;
  const companyName = testData.companyMeta.name || '';
  const suffix = testData.companyMeta.suffix || ((testData.credentials.email || '').match(/(\d{3})$/) || [,''])[1] || '';
  const baseNoLimited = companyName.replace(/\bLimited\b/ig, '').trim();
  const companyKey = `${baseNoLimited.replace(/[^a-zA-Z0-9]/g, '')}${suffix}`.toLowerCase();
  return `${roleDef.prefix}${companyKey}@yopmail.com`;
}

test.describe.serial('Complete invite process for role users', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {LoginPage} */
  let loginPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page, context);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.only('invite acceptance and onboarding for Admin, Accountant, Cardholder', async () => {
    for (const def of roles) {
      const email = roleEmail(def);
      const local = email.split('@')[0];

      // Start at home and choose Join Company
      await page.goto('/');
      await page.getByText('Join a company').click();

      // Retrieve invite code from email
      const inviteCode = await LoginPage.fetchEmailOtp(context, local);
      const inviteField = page.getByLabel(/invitation code|invite code/i);
      await inviteField.fill(inviteCode);
      await page.getByRole('button', { name: /next|continue/i }).click();

      // Verify details match
      const companyName = testData.companyMeta.name || '';
      await expect(page.getByLabel(/company name/i)).toHaveValue(new RegExp(companyName, 'i'));
      await expect(page.getByLabel(/first name/i)).toHaveValue(new RegExp(def.first, 'i'));
      await expect(page.getByLabel(/last name/i)).toHaveValue(new RegExp(def.last, 'i'));
      await expect(page.getByLabel(/email address|email/i)).toHaveValue(email);
      await page.getByRole('button', { name: /continue|next/i }).click();

      // Email verification: fetch OTP for the user inbox
      await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
      const emailOtp = await LoginPage.fetchEmailOtp(context, local);
      for (let i = 0; i < emailOtp.length; i++) {
        await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(emailOtp[i]);
      }
      await page.getByRole('button', { name: /continue|verify|confirm/i }).click();

      // Mobile number confirmation screen -> click Continue first
      await page.getByRole('button', { name: /continue|next/i }).click();

      // Mobile verification: fetch from shared mobile inbox
      await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
      const mobileOtp = await LoginPage.fetchMobileOtp(context);
      for (let i = 0; i < mobileOtp.length; i++) {
        await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(mobileOtp[i]);
      }
      await page.getByRole('button', { name: /continue|verify|confirm/i }).click();

      // Set password
      const pwd = 'xpendless@A1';
      const pwdInput = page.locator('input[type="password"]').first();
      await pwdInput.waitFor();
      await pwdInput.fill(pwd);
      await page.getByRole('button', { name: /continue|next|create|set password|submit/i }).click();

      // Confirm password
      const pwdConfirm = page.locator('input[type="password"]').first();
      await pwdConfirm.waitFor();
      await pwdConfirm.fill(pwd);
      await page.getByRole('button', { name: /continue|next|create|set password|submit/i }).click();

      // Verify successful login, then logout
      await page.getByRole('link', { name: /dashboard/i }).waitFor();
      await loginPage.logout();

      // Persist role credentials with password
      testData.updateRoleCredentials(def.key, email, pwd);
    }
  });
});

