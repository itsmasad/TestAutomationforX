#!/usr/bin/env node
const { spawnSync } = require('child_process');
const args = process.argv.slice(2);
const envName = args[0];
if (!envName) {
  console.error('Usage: npm test <env> [playwright args]');
  process.exit(1);
}
process.env.CURRENT_ENV = envName;
const result = spawnSync('npx', ['playwright', 'test', ...args.slice(1)], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status);
