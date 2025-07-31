module.exports = {
  credentials: {
    email: 'Ryan_Adams1@yopmail.com',
    password: 'Xpendless@A1',
  },
  /**
   * Update the credentials used by tests at runtime.
   * @param {string} email - The email address to use for subsequent logins.
   * @param {string} [password] - Optional password, defaults to existing one.
   */
  updateCredentials(email, password) {
    if (email) this.credentials.email = email;
    if (password) this.credentials.password = password;
  },
  otp: {
    mobile: '123456',
  },
  pettyCash: {
    add: {
      amount: '200',
      description: 'Adding petty cash',
    },
    withdraw: {
      amount: '100',
      description: 'Withdrawing petty cash',
    },
  },
  wallet: {
    add: {
      amount: '1000',
      narrative: 'Adding Fund',
    },
    withdraw: {
      amount: '500',
      narrative: 'Withdrawing Fund',
    },
  },
  company: {
    password: 'xpendless@A1',
    addressLine1: '123 Verification St',
    addressLine2: 'Suite 5',
    city: 'Nairobi',
    postalCode: '00100',
    phone: '0712345678',
    email: 'testcompany@yopmail.com',
  },
  odoo: {
    stagingUrl: 'https://stg-odoo.xpendless.dev/odoo/action-483',
    username: 'info@xpendless.com',
    password: 'abc123',
  },
};
