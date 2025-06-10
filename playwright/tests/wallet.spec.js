// Import Playwright test runner APIs
const { test, expect } = require('@playwright/test');

// Retrieve the latest OTP from the email inbox
async function fetchOtp(context) {
  const mail = await context.newPage();
  await mail.waitForTimeout(5000);
  await mail.goto('https://yopmail.com/?Ryan_Adams1');
  const inboxFrame = mail.frameLocator('#ifinbox');
  await inboxFrame.locator('div.m').first().click();
  const mailFrame = mail.frameLocator('#ifmail');
  const body = await mailFrame.locator('body').innerText();
  await mail.close();
  return body.match(/\b(\d{6})\b/)[1];
}

// Perform login flow using OTP from email
async function login(page, context) {
  await page.goto('https://xpendless-frontend-staging-d6pkpujjuq-ww.a.run.app/login');
  await page.getByLabel('Email address').fill('Ryan_Adams1@yopmail.com');
  await page.getByLabel('Password').fill('Xpendless@A1');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();

  const otp = await fetchOtp(context);
  const digits = otp.split('');
  for (let i = 0; i < digits.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
  }
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: /dashboard/i }).waitFor();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
}

// Log out from the application
async function logout(page) {
  const logoutLink = page.getByRole('link', { name: /logout/i });
  if (!(await logoutLink.isVisible())) {
    const userMenu = page.getByText(/ryan_adams1/i);
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
  }
  // await logoutLink.click({ force: true });
  await page.getByLabel('Email address').waitFor();
  await expect(page.getByLabel('Email address')).toBeVisible();
}

// Test 1: company wallet add funds
test('company wallet add funds', async ({ page, context }) => {
  await login(page, context);

  // Navigate to the company wallet
  await page.getByRole('link', { name: /company wallet/i }).click();

  // Fill the add funds form
  await page.getByRole('button', { name: /add funds/i }).click();
  await page.getByRole('textbox', { name: /^amount\*$/i }).fill('1000');
  await page.getByLabel(/narrative/i).fill('Adding Fund');
  await page.getByRole('button', { name: /^save$/i }).click();

  // Complete OTP verification (mobile OTP is hardcoded for test)
  await page.waitForTimeout(3000);
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const mobileOtp = '123456'.split('');
  for (let i = 0; i < mobileOtp.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(mobileOtp[i]);
  }
  await page.getByRole('button', { name: /continue|confirm|verify/i }).click();

  // Expect success message after adding funds
  await expect(page.getByText(/Fund Added Successfully!/i)).toBeVisible();

  await logout(page);
});

// Test 2: company wallet withdraw funds
test('company wallet withdraw funds', async ({ page, context }) => {
  await login(page, context);

  // Navigate to the wallet withdraw screen
  await page.getByRole('link', { name: /company wallet/i }).click();
  await page.getByRole('button', { name: /withdraw/i }).click();

  // Fill withdrawal form
  await page.getByRole('textbox', { name: /^amount\*$/i }).fill('500');
  await page.getByLabel(/narrative/i).fill('Withdrawing Fund');
  await page.getByRole('button', { name: /^save$/i }).click();

  // Mobile OTP verification step
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const mobileOtp = '123456'.split('');
  for (let i = 0; i < mobileOtp.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(mobileOtp[i]);
  }
  await page.getByRole('button', { name: /continue|confirm|verify/i }).click();

  // Expect success message after withdrawal
  await expect(page.getByText(/Fund Withdrawal Successful!/i)).toBeVisible();

  await logout(page);
});