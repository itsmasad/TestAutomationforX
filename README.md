# TestAutomationforX

This repository contains automated end-to-end tests written in JavaScript using
Playwright.

## Setup

Install Node.js (version 18 or later) and then install Playwright's
dependencies:

```bash
cd playwright
npm install
npx playwright install
```

## Running Playwright Tests

From the same `playwright` directory execute the test suite with:

```bash
npm test
```

If you accidentally run `npm test` from the repository root you will see an
`Error: no test specified` message. Always run the command inside the
`playwright` folder where the `package.json` file lives.
