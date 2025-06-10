# TestAutomationforX

This repository contains automated end-to-end tests written in JavaScript using


## Setup

Install Node.js (version 18 or later) and then install Playwright's
dependencies:

```bash
cd playwright
npm install
npx playwright install
```

The `playwright/.env` file defines the base URLs for each deployment.
When running the tests you choose which environment to target by passing the
desired environment name to the `npm test` command:
`npm test <dev|staging|production>`.
The command uses a small wrapper script that sets the environment before
invoking Playwright.

## Running Playwright Tests

From the same `playwright` directory execute the test suite with:

```bash
npm test staging
```

If you accidentally run `npm test` from the repository root you will see an
`Error: no test specified` message. Always run the command inside the
`playwright` folder where the `package.json` file lives.
