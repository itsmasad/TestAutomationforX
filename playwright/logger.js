const fs = require('fs');
const path = require('path');

// Determine the log file path for this run. `run-tests.js` sets the
// `LOG_FILE` environment variable so that all worker processes append to
// the same file. If it is not provided (e.g. when a test is invoked
// directly), fall back to creating a file with a fresh timestamp.
const logsDir = path.join(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const defaultFile = path.join(
  logsDir,
  `${new Date().toISOString().replace(/[:.]/g, '-')}.log`
);
const filePath = process.env.LOG_FILE || defaultFile;
let stream = fs.createWriteStream(filePath, { flags: 'a' });

function start(testTitle) {
  if (!stream) {
    // In case the stream was manually closed, recreate it using the same
    // run timestamp so all logs for this execution stay in one file.
    stream = fs.createWriteStream(filePath, { flags: 'a' });
  }
  // Separate logs for different tests with a blank line and start each
  // section with the test title.
  stream.write(`\n${testTitle}\n`);
}

function log(message) {
  if (stream) {
    stream.write(`${new Date().toISOString()} - ${message}\n`);
  }
}

function end() {
  // Do not close the stream after each test; keep it open for the entire
  // run so that subsequent tests append to the same file. The stream will
  // be closed on process exit.
}

process.on('exit', () => {
  if (stream) {
    stream.end();
    stream = null;
  }
});

module.exports = { start, log, end };
