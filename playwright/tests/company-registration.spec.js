// Import Playwright test APIs
const { test, expect } = require('@playwright/test');

// Helper functions to generate random test data
function randomEmail() {
  const random = Math.random().toString(36).substring(2, 10);
  return `user_${random}@yopmail.com`;
}

function randomPhone() {
  return `080${Math.floor(10000000 + Math.random() * 9000000)}`;
}

function randomAlpha(length = 6) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

// Test: company registration flow
// Steps reflect the current signup process:
// 1. Enter admin details (first name, last name, email)
// 2. Retrieve the email verification OTP from Yopmail
// 3. Provide mobile number
// 4. Confirm the mobile OTP using static code '123456'
// 5. Set password and confirm password
// 6. Enter business information
// 7. Choose the first subscription package and skip onboarding
// 8. Verify that the dashboard is displayed


test('create company account', async ({ page, context }) => {
  const email = randomEmail();

  const randomSuffix = Date.now().toString().slice(-4);
  const companyName = `Test Company ${randomSuffix}`;
  const adminFirst = `Admin${randomAlpha(5)}`;
  const adminLast = `User${randomAlpha(5)}`;
  const mobile = randomPhone();
  const password = 'Password@123';

  // Navigate to landing page and start registration flow
  await page.goto('https://xpendless-frontend-staging-d6pkpujjuq-ww.a.run.app/');
  await page.getByRole('link', { name: /create account for your company/i }).click();

  // Step 1: admin details
  await page.getByLabel(/first name/i).fill(adminFirst);
  await page.getByLabel(/last name/i).fill(adminLast);
  await page.getByLabel(/email address/i).fill(email);
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 2: verify email via OTP retrieved from Yopmail
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const inbox = email.split('@')[0];
  const mail = await context.newPage();
  await mail.waitForTimeout(5000);
  await mail.goto(`https://yopmail.com/?${inbox}`);
  const inboxFrame = mail.frameLocator('#ifinbox');
  await inboxFrame.locator('div.m').first().click();
  const mailFrame = mail.frameLocator('#ifmail');
  const body = await mailFrame.locator('body').innerText();
  await mail.close();
  const otpEmail = body.match(/\b(\d{6})\b/)[1];
  for (let i = 0; i < otpEmail.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(otpEmail[i]);
  }
  await page.getByRole('button', { name: /continue|verify|confirm/i }).click();

  // Step 3: mobile number
  await page.getByLabel(/mobile number/i).fill(mobile);
  await page.getByRole('button', { name: /continue|next/i }).click();


  // Step 4: confirm mobile OTP with static value
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const otpDigits = '123456'.split('');
  for (let i = 0; i < otpDigits.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(otpDigits[i]);
  }
  await page.getByRole('button', { name: /continue|confirm|verify/i }).click();

  // Step 5: set password
  await page.getByLabel(/password/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole('button', { name: /continue|create account/i }).click();

  // Step 6: business information
  await page.getByLabel(/business name/i).fill(companyName);
  await page.getByRole('button', { name: /create account|continue/i }).click();

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

