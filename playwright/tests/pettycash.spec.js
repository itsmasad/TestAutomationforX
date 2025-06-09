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
  await page.getByLabel('Email address').waitFor();
  await expect(page.getByLabel('Email address')).toBeVisible();
}

// Test: petty cash add cash
test('petty cash add cash', async ({ page, context }) => {
  await login(page, context);
  await page.getByRole('link', { name: /petty cash/i }).click();
  await page.locator('#add_petty_cash').click();
  await page.locator('#add_amount_petty_cash').fill('200');
  await page.locator('#add_desc_petty_cash').fill('Adding petty cash');
  await page.locator('#submit_add_petty_cash').click();
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  await logout(page);
});

// Test: petty cash withdraw cash
test('petty cash withdraw cash', async ({ page, context }) => {
  await login(page, context);
  await page.getByRole('link', { name: /petty cash/i }).click();
  await page.locator('#withdraw_petty_cash').click();
  await page.locator('#withraw_amount_petty_cash').fill('100');
  await page.locator('#withdraw_desc_petty_cash').fill('Withdrawing petty cash');
  await page.locator('#submit_withdraw_petty_cash').click();
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  await logout(page);
});

