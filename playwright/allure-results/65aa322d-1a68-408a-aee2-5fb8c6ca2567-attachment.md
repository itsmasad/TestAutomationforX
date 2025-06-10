# Test info

- Name: login with OTP
- Location: C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\tests\login.spec.js:6:1

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "https://xpendless-frontend-staging-d6pkpujjuq-ww.a.run.app/login", waiting until "load"

    at LoginPage.goto (C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\pages\login-page.js:39:21)
    at LoginPage.login (C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\pages\login-page.js:48:16)
    at C:\Users\SG\Desktop\Code\TestAutomationforXpens\TestAutomationforX\playwright\tests\login.spec.js:8:19
```

# Test source

```ts
   1 | const testData = require('../testdata');
   2 |
   3 | /**
   4 |  * Page object modelling the login functionality.
   5 |  */
   6 | class LoginPage {
   7 |   /**
   8 |    * @param {import('@playwright/test').Page} page - Playwright page instance.
   9 |    * @param {import('@playwright/test').BrowserContext} context - Browser context for opening new pages.
  10 |    */
  11 |   constructor(page, context) {
  12 |     this.page = page;
  13 |     this.context = context;
  14 |   }
  15 |
  16 |   /**
  17 |    * Retrieve the one time password from the temporary mailbox.
  18 |    * @param {import('@playwright/test').BrowserContext} context - Browser context to use.
  19 |    * @param {string} inbox - Name of the yopmail inbox to read from.
  20 |    * @returns {Promise<string>} The six digit OTP code found in the email.
  21 |    */
  22 |   static async fetchEmailOtp(context, inbox) {
  23 |     const mail = await context.newPage();
  24 |     // Wait briefly to allow the OTP email to arrive
  25 |     await mail.waitForTimeout(5000);
  26 |     await mail.goto(`https://yopmail.com/?${inbox}`);
  27 |
  28 |     // Open the first message in the inbox and read its body
  29 |     const inboxFrame = mail.frameLocator('#ifinbox');
  30 |     await inboxFrame.locator('div.m').first().click();
  31 |     const mailFrame = mail.frameLocator('#ifmail');
  32 |     const body = await mailFrame.locator('body').innerText();
  33 |     await mail.close();
  34 |     return body.match(/\b(\d{6})\b/)[1];
  35 |   }
  36 |
  37 |   /** Navigate to the application's login page. */
  38 |   async goto() {
> 39 |     await this.page.goto('/login');
     |                     ^ Error: page.goto: Target page, context or browser has been closed
  40 |   }
  41 |
  42 |   /**
  43 |    * Perform the complete login flow using email OTP authentication.
  44 |    * @param {string} [email=testData.credentials.email] - User email address.
  45 |    * @param {string} [password=testData.credentials.password] - User password.
  46 |    */
  47 |   async login(email = testData.credentials.email, password = testData.credentials.password) {
  48 |     await this.goto();
  49 |     await this.page.getByLabel('Email address').fill(email);
  50 |     await this.page.getByLabel('Password').fill(password);
  51 |     await this.page.getByRole('button', { name: 'Login' }).click();
  52 |
  53 |     // Wait for the OTP entry fields to appear
  54 |     await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor();
  55 |     const inbox = email.split('@')[0];
  56 |     const otp = await LoginPage.fetchEmailOtp(this.context, inbox);
  57 |     const digits = otp.split('');
  58 |     for (let i = 0; i < digits.length; i++) {
  59 |       await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
  60 |     }
  61 |     await this.page.getByRole('button', { name: 'Login' }).click();
  62 |     await this.page.getByRole('link', { name: /dashboard/i }).waitFor();
  63 |   }
  64 |
  65 |   /**
  66 |    * Log out of the application.
  67 |    * Some pages expose the logout link only after opening the user menu.
  68 |    */
  69 |   async logout() {
  70 |     const logoutLink = this.page.getByRole('link', { name: /logout/i });
  71 |     if (!(await logoutLink.isVisible())) {
  72 |       const userMenu = this.page.getByText(/ryan_adams1/i);
  73 |       if (await userMenu.isVisible()) {
  74 |         await userMenu.click();
  75 |       }
  76 |     }
  77 |     await this.page.getByLabel('Email address').waitFor();
  78 |   }
  79 | }
  80 |
  81 | module.exports = { LoginPage };
  82 |
```