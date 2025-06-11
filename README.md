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

```bash
npm test <dev|staging|prod>
```
Use `prod` when you want to run tests against the production deployment.


The command uses a small wrapper script that sets the environment before
invoking Playwright. You can also set the `CURRENT_ENV` variable manually if
you prefer to call `npx playwright` directly:

* **Unix/macOS**
  ```bash
  CURRENT_ENV=staging npx playwright test
  ```
* **Windows PowerShell**
  ```powershell
  $env:CURRENT_ENV = "staging"
  npx playwright test
  ```
* **Windows cmd.exe**
  ```cmd
  set CURRENT_ENV=staging && npx playwright test
  ```

Additional Playwright options such as `--headed` can be appended after the
environment name when using `npm test`, e.g. `npm test staging -- --headed`.

## Running Playwright Tests

From the same `playwright` directory execute the test suite with:

```bash
npm test staging
```
To target the production site:
```bash
npm test prod
```

If you accidentally run `npm test` from the repository root you will see an
`Error: no test specified` message. Always run the command inside the
`playwright` folder where the `package.json` file lives.

## Test Data

Reusable values such as login credentials and transaction amounts are defined in
`playwright/testdata/index.js`. Tests and page objects import these constants so
that data can be managed in a single location.

## Test Reports

1. **Run the tests first.** From the `playwright` directory execute:

   ```bash
   npm test <dev|staging|prod>
   ```

   This populates `playwright/allure-results` with the data used by the report.
   The reporter always writes to this folder so the command works even
   when tests are started from another directory.

2. **Generate the report** while still inside the `playwright` folder:

   ```bash
   npm run report:allure
   ```

   The command creates an `allure-report` folder containing the HTML output.
   View it locally with:

   ```bash
   npx allure open ./allure-report
   ```

The report lists each test along with its pass/fail status and stack trace.
If a test fails, the hooks in `test-hooks.js` capture a screenshot which is
attached to the report.
The report also records the browser used and which deployment environment
(`dev`, `staging`, or `prod`) was targeted during the run. This information is
written automatically when the tests start in `global-setup.js`. As long as you
launch the suite via `npm test <env>` (or set `CURRENT_ENV` when calling
`npx playwright test`), the generated Allure report will include the environment
and browser details.

## Continuous Integration

The Playwright test suite runs automatically on GitHub Actions after changes are merged into the `main` branch. The workflow file is located at `.github/workflows/playwright.yml` and executes the suite on a Windows runner using the Chrome browser.
