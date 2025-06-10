const fs = require('fs');
const path = require('path');

async function globalSetup(config) {
  const envName = process.env.CURRENT_ENV || process.env.npm_config_env || 'staging';
  const browser = config.projects?.[0]?.use?.browserName || 'chromium';
  const resultsDir = path.join(__dirname, 'allure-results');
  await fs.promises.mkdir(resultsDir, { recursive: true });
  const envFile = path.join(resultsDir, 'environment.properties');
  await fs.promises.writeFile(envFile, `Environment=${envName}\nBrowser=${browser}\n`);
}

module.exports = globalSetup;
