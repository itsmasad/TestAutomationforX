# Test info

- Name: create company account
- Location: C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\tests\company-registration.spec.js:8:1

# Error details

```
Error: locator.waitFor: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('link', { name: /dashboard/i }) to be visible

    at CompanyRegistrationPage.registerCompany (C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\pages\company-registration-page.js:86:63)
    at C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\tests\company-registration.spec.js:10:3
```

# Test source

```ts
   1 | const { faker } = require('@faker-js/faker');
   2 | const { LoginPage } = require('./login-page');
   3 | const testData = require('../testdata');
   4 |
   5 | /**
   6 |  * Page object representing the company registration workflow.
   7 |  */
   8 | class CompanyRegistrationPage {
   9 |   /**
  10 |    * @param {import('@playwright/test').Page} page
  11 |    * @param {import('@playwright/test').BrowserContext} context
  12 |    */
  13 |   constructor(page, context) {
  14 |     this.page = page;
  15 |     this.context = context;
  16 |   }
  17 |
  18 |   /**
  19 |    * Complete the full company registration flow.
  20 |    */
  21 |   async registerCompany() {
  22 |     // Generate basic details for the administrator and company
  23 |     const adminFirst = faker.person.firstName();
  24 |     const adminLast = faker.person.lastName();
  25 |     const email = `${adminFirst.toLowerCase()}${faker.number.int({ min: 100, max: 999 })}@yopmail.com`;
  26 |     const companyName = `${adminFirst} Limited ${faker.number.int({ min: 100, max: 999 })}`;
  27 |     const mobile = `${Math.floor(100000000 + Math.random() * 900000000)}`;
  28 |     const password = testData.company.password;
  29 |
  30 |     // Begin registration on the landing page
  31 |     await this.page.goto('/');
  32 |     await this.page.getByRole('link', { name: /create account for your company/i }).click();
  33 |
  34 |     await this.page.getByLabel(/first name/i).fill(adminFirst);
  35 |     await this.page.getByLabel(/last name/i).fill(adminLast);
  36 |     await this.page.getByLabel(/email address/i).fill(email);
  37 |     await this.page.getByRole('button', { name: /continue/i }).click();
  38 |
  39 |     // Email OTP verification
  40 |     await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  41 |     const inbox = email.split('@')[0];
  42 |     const otpEmail = await LoginPage.fetchEmailOtp(this.context, inbox);
  43 |     for (let i = 0; i < otpEmail.length; i++) {
  44 |       await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(otpEmail[i]);
  45 |     }
  46 |     await this.page.getByRole('button', { name: /continue|verify|confirm/i }).click();
  47 |
  48 |     // Mobile number verification
  49 |     await this.page.getByLabel(/mobile number/i).fill(mobile);
  50 |     await this.page.getByRole('button', { name: /continue|next/i }).click();
  51 |
  52 |     await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  53 |     // Mobile OTP is currently static during development
  54 |     const digits = testData.otp.mobile.split('');
  55 |     for (let i = 0; i < digits.length; i++) {
  56 |       await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
  57 |     }
  58 |     await this.page.getByRole('button', { name: /continue|confirm|verify/i }).click();
  59 |
  60 |     // Set account password
  61 |     const passwordInput = this.page.locator('input[type="password"]');
  62 |     await passwordInput.waitFor();
  63 |     await passwordInput.fill(password);
  64 |     await this.page.getByRole('button', { name: /continue|create account/i }).click();
  65 |
  66 |     await passwordInput.waitFor();
  67 |     await passwordInput.fill(password);
  68 |     await this.page.getByRole('button', { name: /continue|create account/i }).click();
  69 |
  70 |     // Fill company details
  71 |     await this.page.getByLabel(/company name/i).waitFor();
  72 |     await this.page.getByLabel(/company name/i).fill(companyName);
  73 |     const regNo = `${Math.floor(10000000 + Math.random() * 90000000)}`;
  74 |     await this.page.getByLabel(/registration number/i).fill(regNo);
  75 |     await this.page.getByRole('button', { name: /register/i }).click();
  76 |
  77 |     await this.page.getByRole('button', { name: /select plan|Get Subscription/i }).first().click();
  78 |     await this.page.waitForTimeout(2000);
  79 |
  80 |     // Some flows allow skipping the subscription selection
  81 |     const skipButton = this.page.getByText(/^Skip$/i);
  82 |     if (await skipButton.isVisible()) {
  83 |       await skipButton.click();
  84 |     }
  85 |
> 86 |     await this.page.getByRole('link', { name: /dashboard/i }).waitFor();
     |                                                               ^ Error: locator.waitFor: Target page, context or browser has been closed
  87 |   }
  88 | }
  89 |
  90 | module.exports = { CompanyRegistrationPage };
  91 |
```