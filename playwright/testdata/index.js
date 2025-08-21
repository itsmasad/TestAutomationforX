const fs = require('fs');
const path = require('path');

const credPath = path.join(__dirname, 'credentials.json');
let storedCreds = {};
try {
  storedCreds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
} catch {
  // file does not exist or is invalid, fall back to defaults
}

module.exports = {
  credentials: {
    email: storedCreds.email || 'Ryan_Adams1@yopmail.com',
    password: storedCreds.password || 'Xpendless@A1',
  },
  /**
   * Update the credentials used by tests at runtime.
   * @param {string} email - The email address to use for subsequent logins.
   * @param {string} [password] - Optional password, defaults to existing one.
   */
  updateCredentials(email, password) {
    if (email) this.credentials.email = email;
    if (password) this.credentials.password = password;
    try {
      fs.writeFileSync(credPath, JSON.stringify(this.credentials));
      storedCreds = { ...this.credentials };
    } catch {
      // ignore file write errors
    }
    // also update this file so the defaults reflect the latest credentials
    try {
      const fileContent = fs
        .readFileSync(__filename, 'utf8')
        .replace(
          /email: storedCreds.email \|\| '.*',/,
          `email: storedCreds.email || '${this.credentials.email}',`
        )
        .replace(
          /password: storedCreds.password \|\| '.*',/,
          `password: storedCreds.password || '${this.credentials.password}',`
        );
      fs.writeFileSync(__filename, fileContent);
    } catch {
      // ignore file update errors
    }
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
  teams: {
    departmentName: 'Marketing',
  },
  taxCode: {
    name: 'FBR',
    rate: '40',
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
