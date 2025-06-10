// Import Playwright test APIs
const { test, expect } = require('@playwright/test');

// Helper to generate random test data
function generateRandomEmail() {
  const random = Math.random().toString(36).substring(2, 8);
  return `test_${random}@yopmail.com`;
}

// Test: company registration flow
// - fills the registration form with random data
// - confirms the mobile OTP using static code '123456'
// - selects the first available subscription package
// - skips optional onboarding screens
// - verifies that dashboard is shown after registration

test('create company account', async ({ page }) => {
  const email = generateRandomEmail();
  const randomSuffix = Date.now().toString().slice(-4);
  const companyName = `Test Company ${randomSuffix}`;
  const adminFirst = `Admin${randomSuffix}`;
  const adminLast = `User${randomSuffix}`;
  const mobile = `080${Math.floor(Math.random() * 9000000 + 1000000)}`;
  const password = 'Password@123';

  // Navigate to the registration page
  await page.goto('https://xpendless-frontend-staging-d6pkpujjuq-ww.a.run.app/create-account');

  // Fill company details
  await page.getByLabel(/business name/i).fill(companyName);
  await page.getByLabel(/admin first name/i).fill(adminFirst);
  await page.getByLabel(/admin last name/i).fill(adminLast);
  await page.getByLabel(/admin email/i).fill(email);
  await page.getByLabel(/mobile number/i).fill(mobile);
  await page.getByLabel(/password/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);

  // Submit the registration form
  await page.getByRole('button', { name: /create account/i }).click();

  // Confirm OTP with static value
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const otpDigits = '123456'.split('');
  for (let i = 0; i < otpDigits.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(otpDigits[i]);
  }
  await page.getByRole('button', { name: /continue|confirm|verify/i }).click();

  // Choose the first subscription package
  await page.getByRole('button', { name: /select plan|subscribe/i }).first().click();

  // Skip onboarding screens if present
  const skipButton = page.getByRole('button', { name: /skip/i });
  if (await skipButton.isVisible()) {
    await skipButton.click();
  }

  // Expect dashboard link to appear indicating successful registration
  await page.getByRole('link', { name: /dashboard/i }).waitFor();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});

