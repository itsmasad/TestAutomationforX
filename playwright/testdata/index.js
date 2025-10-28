const fs = require('fs');
const path = require('path');

const credPath = path.join(__dirname, 'credentials.json');

function normalizeRoleKey(role) {
  const key = (role || '').toString().toLowerCase().replace(/[^a-z]+/g, '');
  if (key === 'cardholder') return 'Cardholder';
  if (key === 'accountant') return 'Accountant';
  return 'Admin';
}

function normalizeStoredRoles(roles) {
  const out = { Admin: {}, Accountant: {}, Cardholder: {} };
  if (!roles || typeof roles !== 'object') return out;
  for (const [k, v] of Object.entries(roles)) {
    const nk = normalizeRoleKey(k);
    out[nk] = { ...(out[nk] || {}), ...(v || {}) };
  }
  return out;
}

let storedCreds = {};
try {
  storedCreds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  if (storedCreds && storedCreds.roles) {
    storedCreds.roles = normalizeStoredRoles(storedCreds.roles);
  }
} catch {
  // file does not exist or is invalid, fall back to defaults
}

module.exports = {
  credentials: {
    email: storedCreds.email || 'oda247@yopmail.com',
    password: storedCreds.password || 'xpendless@A1',
  },
  // Company metadata captured during company registration
  companyMeta: {
    name: storedCreds.companyName || '',
    suffix: storedCreds.companySuffix || '',
  },
  // Role credentials persisted after user creation/invite
  roles: (() => {
    const sc = normalizeStoredRoles(storedCreds.roles || {});
    return {
      Admin: {
        email: process.env.XP_ADMIN_EMAIL || (sc.Admin && sc.Admin.email) || '',
        password: (sc.Admin && sc.Admin.password) || '',
      },
      Accountant: {
        email: process.env.XP_ACCOUNTANT_EMAIL || (sc.Accountant && sc.Accountant.email) || '',
        password: (sc.Accountant && sc.Accountant.password) || '',
      },
      Cardholder: {
        email: process.env.XP_CARDHOLDER_EMAIL || (sc.Cardholder && sc.Cardholder.email) || '',
        password: (sc.Cardholder && sc.Cardholder.password) || '',
      },
    };
  })(),
  /**
   * Update the credentials used by tests at runtime.
   * @param {string} email - The email address to use for subsequent logins.
   * @param {string} [password] - Optional password, defaults to existing one.
   */
  updateCredentials(email, password) {
    if (email) this.credentials.email = email;
    if (password) this.credentials.password = password;
    try {
      const current = fs.existsSync(credPath)
        ? JSON.parse(fs.readFileSync(credPath, 'utf8'))
        : {};
      const merged = { ...current, ...this.credentials };
      fs.writeFileSync(credPath, JSON.stringify(merged));
      storedCreds = { ...merged };
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
  /**
   * Persist company name and 3-digit suffix for reuse in user creation.
   * @param {string} name - Company legal name (e.g., "Kailey Limited 781").
   * @param {string} suffix - Three digit string used during registration (e.g., "781").
   */
  updateCompanyMeta(name, suffix) {
    if (name) this.companyMeta.name = name;
    if (suffix) this.companyMeta.suffix = suffix;
    try {
      const current = fs.existsSync(credPath)
        ? JSON.parse(fs.readFileSync(credPath, 'utf8'))
        : {};
      const merged = {
        ...current,
        companyName: this.companyMeta.name,
        companySuffix: this.companyMeta.suffix,
        roles: current.roles,
      };
      fs.writeFileSync(credPath, JSON.stringify(merged));
      storedCreds = { ...merged };
    } catch {
      // ignore file write errors
    }
  },
  /**
   * Persist role credentials (email and optionally password).
   * @param {string} role - One of 'Admin' | 'Accountant' | 'Cardholder'
   * @param {string} email
   * @param {string} [password]
   */
  updateRoleCredentials(role, email, password) {
    const key = normalizeRoleKey(role);
    this.roles[key] = this.roles[key] || { email: '', password: '' };
    if (email) this.roles[key].email = email;
    if (password) this.roles[key].password = password;
    try {
      const current = fs.existsSync(credPath)
        ? JSON.parse(fs.readFileSync(credPath, 'utf8'))
        : {};
      const existingRoles = normalizeStoredRoles(current.roles || {});
      const mergedRoles = { ...existingRoles, [key]: { ...existingRoles[key], ...this.roles[key] } };
      const merged = { ...current, roles: mergedRoles };
      fs.writeFileSync(credPath, JSON.stringify(merged));
      storedCreds = { ...merged };
    } catch {
      // ignore file write errors
    }
  },
  /**
   * Store credentials for Admin, Accountant and Cardholder in a single call.
   * Any missing role entries are left unchanged.
   * @param {{ email?: string, password?: string }} [admin]
   * @param {{ email?: string, password?: string }} [accountant]
   * @param {{ email?: string, password?: string }} [cardholder]
   */
  storeAllRoleCredentials(admin, accountant, cardholder) {
    const apply = (key, data) => {
      if (!data) return;
      const { email, password } = data;
      this.updateRoleCredentials(key, email, password);
    };
    apply('Admin', admin);
    apply('Accountant', accountant);
    apply('Cardholder', cardholder);
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
  categoryGroup: {
    name: 'Food',
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
