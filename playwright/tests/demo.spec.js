import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://xpendless-frontend-staging-d6pkpujjuq-ww.a.run.app/login');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('marlen616@yopmail.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('xpendless@A1');
  await page.getByRole('button', { name: 'Login' }).click();
  await page1.goto('https://yopmail.com/');
  await page1.getByRole('textbox', { name: 'Login' }).click();
  await page1.getByRole('textbox', { name: 'Login' }).fill('marlen616@yopmail.com');
  await page1.getByRole('textbox', { name: 'Login' }).press('Enter');
  await page1.getByRole('button', { name: '' }).click();
  await page1.locator('iframe[name="ifmail"]').contentFrame().getByText('797800').dblclick();
  await page1.locator('iframe[name="ifmail"]').contentFrame().locator('body').press('ControlOrMeta+c');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('div').filter({ hasText: /^Attachments$/ }).first().click();
  await page.locator('div').filter({ hasText: /^Attachments$/ }).first().click();
  await page.getByText('How many are you?SelectJust').click();
  await page.getByLabel('How many are you?').selectOption('8');
  await page.locator('#webpack-dev-server-client-overlay').contentFrame().getByRole('button', { name: 'Dismiss' }).click();
  await page.getByLabel('How much do you approximately').selectOption('2');
  await page.locator('#webpack-dev-server-client-overlay').contentFrame().getByText('Uncaught runtime errors:×').click();
  await page.locator('#webpack-dev-server-client-overlay').contentFrame().getByRole('button', { name: 'Dismiss' }).click();
  await page.getByLabel('Where do you expect Xpendless').selectOption('5');
  await page.locator('#webpack-dev-server-client-overlay').contentFrame().getByRole('button', { name: 'Dismiss' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('img', { name: 'Document upload icon' }).first().click();
  await page.locator('body').setInputFiles('logo.png');
  await page.getByRole('img', { name: 'Document upload icon' }).click();
  await page.locator('body').setInputFiles('logo.png');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Terms & conditions').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('checkbox', { name: 'I hereby agree to the Terms' }).check();
  await page.getByRole('button', { name: 'Submit for Verification' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});