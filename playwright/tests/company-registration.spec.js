// Import Playwright test APIs
const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

// Helper functions to generate random test data
function randomPhone() {
  // Return a 9-digit phone number
  return `${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function randomRegistrationNumber() {
  return `${Math.floor(10000000 + Math.random() * 90000000)}`;
}

// Test: company registration flow
// Steps reflect the current signup process:
// 1. Enter admin details (first name, last name, email)
// 2. Retrieve the email verification OTP from Yopmail
// 3. Provide mobile number
// 4. Confirm the mobile OTP using static code '123456'
// 5. Set password
// 6. Confirm password
// 7. Enter business information
// 8. Choose the first subscription package and skip onboarding
// 9. Verify that the dashboard is displayed


test('create company account', async ({ page, context }) => {
  const adminFirst = faker.person.firstName();
  const adminLast = faker.person.lastName();
  const email = `${adminFirst.toLowerCase()}${faker.number.int({ min: 100, max: 999 })}@yopmail.com`;
  const companyName = `${adminFirst} Limited ${faker.number.int({ min: 100, max: 999 })}`;
  const mobile = randomPhone();
  const password = 'xpendless@A1';

  // Navigate to landing page and start registration flow
  await page.goto('/');
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

  // Step 5: provide password then continue
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor();
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /continue|create account/i }).click();

  // Step 6: confirm password on the next screen
  await passwordInput.waitFor();
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /continue|create account/i }).click();

  // Step 7: business information
  await page.getByLabel(/company name/i).waitFor();
  await page.getByLabel(/company name/i).fill(companyName);
  const regNo = randomRegistrationNumber();
  await page.getByLabel(/registration number/i).fill(regNo);
  await page.getByRole('button', { name: /register/i }).click();

  // Choose the first subscription package
  
  await page.getByRole('button', { name: /select plan|Get Subscription/i }).first().click();
  await page.waitForTimeout(2000)

  // Skip onboarding screens if present
  // const skipButton = page.getByRole('div', { name: /skip/i });
  const skipButton = page.getByText(/^Skip$/i);
  if (await skipButton.isVisible()) {
    await skipButton.click();
  }

  // Expect dashboard link to appear indicating successful registration
  await page.getByRole('link', { name: /dashboard/i }).waitFor();
  await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
});

