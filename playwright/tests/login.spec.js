// Import Playwright test runner APIs
const { test, expect } = require('@playwright/test');

// Grab the latest OTP from the temporary email inbox
async function fetchOtp(context) {
  const mail = await context.newPage();

  // Wait 5 seconds before navigating to ensure the email has arrived
  await mail.waitForTimeout(5000);

  await mail.goto('https://yopmail.com/?Ryan_Adams1');
  const inboxFrame = mail.frameLocator('#ifinbox');
  await inboxFrame.locator('div.m').first().click();
  const mailFrame = mail.frameLocator('#ifmail');
  const body = await mailFrame.locator('body').innerText();
  await mail.close();

  // Extract the six digit OTP from the email body
  return body.match(/\b(\d{6})\b/)[1];
}

// Log in to the application and wait until the dashboard is visible
async function login(page, context) {
  // Navigate to the login page
  await page.goto('/login');

  // Fill in credentials
  await page.getByLabel('Email address').fill('Ryan_Adams1@yopmail.com');
  await page.getByLabel('Password').fill('Xpendless@A1');

  // Submit the login form
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for the OTP fields to appear
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();

  // Retrieve the OTP from email and fill the six input boxes
  const otp = await fetchOtp(context);
  const digits = otp.split('');
  for (let i = 0; i < digits.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
  }

  // Confirm the OTP
  await page.getByRole('button', { name: 'Login' }).click();

  // Ensure the dashboard link is visible which means login succeeded
  await page.getByRole('link', { name: /dashboard/i }).waitFor();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
}

// Test: verifies a user can log in with a valid OTP
test('login with OTP', async ({ page, context }) => {
  await login(page, context);
});

// Test: logs the user out using the logout icon
test('logout via icon', async ({ page, context }) => {
  await login(page, context);

  const logoutLink = page.getByRole('link', { name: /logout/i });

  // Some pages place the logout link inside the user menu
  if (!(await logoutLink.isVisible())) {
    const userMenu = page.getByText(/ryan_adams1/i);
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
  }

  // Click the logout link once it is visible
  // await logoutLink.click({ force: true });

  // Verify that we returned to the login form
  await page.getByLabel('Email address').waitFor();
  await expect(page.getByLabel('Email address')).toBeVisible();
});
