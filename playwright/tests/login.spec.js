const { test, expect } = require('@playwright/test');

async function fetchOtp(context) {
  const mail = await context.newPage();

  // Wait 5 seconds before navigating
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

test('login with OTP', async ({ page, context }) => {
  await login(page, context);
});

test('logout via icon', async ({ page, context }) => {
  await login(page, context);
  const logoutLink = page.getByRole('link', { name: /logout/i });
  if (!(await logoutLink.isVisible())) {
    await page.locator('button.navbar-toggler').click();
  }
  await logoutLink.click({ force: true });
  await page.getByLabel('Email address').waitFor();
  await expect(page.getByLabel('Email address')).toBeVisible();
});
