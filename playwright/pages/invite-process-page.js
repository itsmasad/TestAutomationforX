const { LoginPage } = require('./login-page');
const testData = require('../testdata');
const logger = require('../logger');

/**
 * Page object to handle the full user invite acceptance and onboarding flow.
 */
class InviteProcessPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').BrowserContext} context
   */
  constructor(page, context) {
    this.page = page;
    this.context = context;
  }

  /** Navigate to Join Company entry point. */
  async startJoinFlow() {
    await this.page.goto('/');
    logger.log('Click "Join a company"');
    await this.page.getByText('Join a company').click();
  }

  /**
   * Compute role email from saved data or by deriving from company name + suffix.
   * @param {{ key: 'Admin'|'Accountant'|'Cardholder', first: string, last: string, prefix: string }} def
   */
  roleEmail(def) {
    const saved = testData.roles[def.key]?.email;
    if (!saved) {
      throw new Error(`Missing saved email for role ${def.key}. Ensure user-creation test stored it in testdata/credentials.json`);
    }
    logger.log(`Using saved invite email for ${def.key}: ${saved}`);
    return saved;
  }

  /** Fill the OTP widget with a 6-digit code. */
  async fillOtp(otp) {
    for (let i = 0; i < otp.length; i++) {
      await this.page
        .getByRole('textbox', { name: `Please enter OTP character ${i + 1}` })
        .fill(otp[i]);
    }
  }

  /**
   * Complete the entire invite flow for a single role definition.
   * Persists the resulting credentials in testdata.
   * @param {{ key: 'Admin'|'Accountant'|'Cardholder', first: string, last: string, prefix: string }} def
   */
  async completeInviteForRole(def) {
    const email = this.roleEmail(def);
    const local = email.split('@')[0];
    const companyName = testData.companyMeta.name || '';

    // Start join
    await this.startJoinFlow();

    // Invitation code via email to original sign-in inbox
    logger.log('Fetch invite code from yopmail');
    const inviteCode = await LoginPage.fetchEmailOtp(this.context, local);
    const inviteField = this.page.getByLabel(/invitation code|invite code/i);
    await inviteField.fill(inviteCode);
    await this.page.getByRole('button', { name: /next|continue/i }).click();

    // Validate prefilled details (ensure presence)
    await logger.log('Validate prefilled user/company details presence');
    await this.page.getByLabel(/company name/i).waitFor();
    await this.page
      .getByRole('button', { name: /continue|next/i })
      .click();

    // Email verification
    await this.page
      .getByRole('textbox', { name: 'Please enter OTP character 1' })
      .waitFor();
    logger.log('Fetch email OTP for invitee');
    const emailOtp = await LoginPage.fetchEmailOtp(this.context, local);
    await this.fillOtp(emailOtp);
    await this.page
      .getByRole('button', { name: /continue|verify|confirm/i })
      .click();

    // Mobile number confirmation screen -> click Continue first
    await this.page.getByRole('button', { name: /continue|next/i }).click();

    // Mobile verification
    await this.page
      .getByRole('textbox', { name: 'Please enter OTP character 1' })
      .waitFor();
    logger.log('Fetch mobile OTP');
    const mobileOtp = await LoginPage.fetchMobileOtp(this.context);
    await this.fillOtp(mobileOtp);
    await this.page
      .getByRole('button', { name: /continue|verify|confirm/i })
      .click();

    // Set password, then confirm password
    const pwd = 'xpendless@A1';
    logger.log('Set new password');
    const pwdInput = this.page.locator('input[type="password"]').first();
    await pwdInput.waitFor();
    await pwdInput.fill(pwd);
    await this.page
      .getByRole('button', { name: /continue|next|create|set password|submit/i })
      .click();
    const pwdConfirm = this.page.locator('input[type="password"]').first();
    await pwdConfirm.waitFor();
    await pwdConfirm.fill(pwd);
    await this.page
      .getByRole('button', { name: /continue|next|create|set password|submit/i })
      .click();

    // Verify landing
    if (def.key === 'Cardholder') {
      // Prefer ARIA link if present
      const expLink = this.page.getByRole('link', { name: /expenses/i });
      if (await expLink.count()) {
        await expLink.first().waitFor();
      } else {
        // Fallback: UI uses a div menu tile for Expenses
        await this.page
          .locator('div.nav-link.menu')
          .filter({ hasText: /\bexpenses\b/i })
          .first()
          .waitFor();
      }
    } else {
      await this.page.getByRole('link', { name: /dashboard/i }).waitFor();
    }

    // Persist role credentials with password
    testData.updateRoleCredentials(def.key, email, pwd);
  }

  /**
   * Complete invite onboarding for an array of role definitions.
   * @param {Array<{ key: 'Admin'|'Accountant'|'Cardholder', first: string, last: string, prefix: string }>} roles
   */
  async completeInvitesForRoles(roles) {
    for (const def of roles) {
      await this.completeInviteForRole(def);
    }
  }
}

module.exports = { InviteProcessPage };
