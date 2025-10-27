const { test, expect } = require('../test-hooks');
const { LoginPage } = require('../pages/login-page');
const { ForgotPasswordPage } = require('../pages/forgot-password-page');
const testData = require('../testdata');

function deriveAccountantEmail() {
  // Prefer stored role email if present
  const saved = (testData.roles && testData.roles.Accountant && testData.roles.Accountant.email) || '';
  if (saved) return saved;
  const companyName = testData.companyMeta.name || '';
  const suffix =
    testData.companyMeta.suffix ||
    ((testData.credentials.email || '').match(/(\d{3})$/) || [, ''])[1] ||
    '';
  const baseNoLimited = companyName.replace(/\bLimited\b/gi, '').trim();
  const companyKey = `${baseNoLimited.replace(/[^a-zA-Z0-9]/g, '')}${suffix}`.toLowerCase();
  return `acc${companyKey}@yopmail.com`;
}

test('forgot password flow - Accountant account', async ({ page, context }) => {
  const loginPage = new LoginPage(page, context);
  const forgot = new ForgotPasswordPage(page, context);

  const accountantEmail = deriveAccountantEmail();

  // Execute full forgot password flow and capture the new password
  const newPassword = await forgot.resetPasswordForEmail(accountantEmail);

  // Persist the updated password for Accountant role
  testData.updateRoleCredentials('Accountant', accountantEmail, newPassword);

  // If main credentials correspond to the same email, update them too so defaults in index.js remain consistent
  if ((testData.credentials.email || '').toLowerCase() === accountantEmail.toLowerCase()) {
    testData.updateCredentials(accountantEmail, newPassword);
  }

  // Optional sanity: verify login works with the new password
  await loginPage.login(accountantEmail, newPassword);
  await expect(page.getByRole('link', { name: /dashboard|expenses/i })).toBeVisible();
  await loginPage.logout();
});

