const { test, expect } = require('@playwright/test');

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
  await page.getByRole('link', { name: /company wallet/i }).click();
  await page.getByRole('button', { name: /add funds/i }).click();
  await page.getByRole('textbox', { name: /^amount\*$/i }).fill('1000');
  await page.getByLabel(/narrative/i).fill('Adding Fund');
  await page.getByRole('button', { name: /^save$/i }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const mobileOtp = '123456'.split('');
  for (let i = 0; i < mobileOtp.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(mobileOtp[i]);
  }
  await page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  await expect(page.getByText(/Fund Added Successfully!/i)).toBeVisible();
  await logout(page);
});

// Test 2: company wallet withdraw funds
test('company wallet withdraw funds', async ({ page, context }) => {
  await login(page, context);
  await page.getByRole('link', { name: /company wallet/i }).click();
  await page.getByRole('button', { name: /withdraw/i }).click();
  await page.getByRole('textbox', { name: /^amount\*$/i }).fill('500');
  await page.getByLabel(/narrative/i).fill('Withdrawing Fund');
  await page.getByRole('button', { name: /^save$/i }).click();
  await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  const mobileOtp = '123456'.split('');
  for (let i = 0; i < mobileOtp.length; i++) {
    await page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(mobileOtp[i]);
  }
  await page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  await expect(page.getByText(/Fund Withdrawal Successful!/i)).toBeVisible();
  await logout(page);
});