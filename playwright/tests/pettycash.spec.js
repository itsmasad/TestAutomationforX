// Import Playwright test runner APIs
const { test, expect } = require('@playwright/test');

// Retrieve the latest OTP sent to the test email address
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

// Perform login flow including fetching OTP from email
async function login(page, context) {
  await page.goto('/login');
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

// Log the user out and ensure we return to the login screen
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

  // Navigate to the petty cash page
  await page.getByRole('link', { name: /petty cash/i }).click();

  // Add new petty cash amount
  await page.locator('#add_petty_cash').click();
  await page.locator('#add_amount_petty_cash').fill('200');
  await page.locator('#add_desc_petty_cash').fill('Adding petty cash');
  await page.locator('#submit_add_petty_cash').click();

  // Confirm success toast appears
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await logout(page);
});

// Test: petty cash withdraw cash
test('petty cash withdraw cash', async ({ page, context }) => {
  await login(page, context);

  // Open petty cash section and start withdraw flow
  await page.getByRole('link', { name: /petty cash/i }).click();
  await page.locator('#withdraw_petty_cash').click();

  // Fill withdrawal form
  await page.locator('#withraw_amount_petty_cash').fill('100');
  await page.locator('#withdraw_desc_petty_cash').fill('Withdrawing petty cash');
  await page.locator('#submit_withdraw_petty_cash').click();

  // Expect success notification
  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await logout(page);
});

// Test: petty cash disburse cash to user
test('petty cash disburse cash to Card Holder', async ({ page, context }) => {
  await login(page, context);

  // Navigate to petty cash and initiate disbursement
  await page.getByRole('link', { name: /petty cash/i }).click();
  await page.getByRole('button', { name: /disburse/i }).click();

  // Choose employee/user to disburse to
  const employeeDrop = page.getByRole('combobox', { name: /employee|user/i });
  await employeeDrop.click();
  await page.getByRole('option', { name: 'Card Holder' }).click();

  // Fill disbursement details
  await page.getByRole('textbox', { name: /amount/i }).fill('150');
  await page.getByRole('textbox', { name: /description|narrative/i }).fill('Disbursing petty cash');
  await page.getByRole('button', { name: /submit|save/i }).click();

  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await logout(page);
});


// Test: petty cash return cash from user "Card Holder"
test('petty cash return cash from user Card Holder', async ({ page, context }) => {
  await login(page, context);

  // Open petty cash return flow
  await page.getByRole('link', { name: /petty cash/i }).click();
  await page.getByRole('button', { name: /return/i }).click();

  // Choose the user returning cash
  const returnDrop = page.getByRole('combobox', { name: /user/i });
  await returnDrop.click();
  await page.getByRole('option', { name: 'Card Holder' }).click();

  // Enter return details
  await page.getByRole('textbox', { name: /amount/i }).fill('50');
  await page.getByRole('textbox', { name: /description|narrative/i }).fill('Returning cash');
  await page.getByRole('button', { name: /submit|save/i }).click();

  await expect(page.locator('.Toastify__toast--success')).toBeVisible();

  await logout(page);
});

