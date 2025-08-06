const fs = require('fs');
const path = require('path');

// Create a single log file for the entire test run. The timestamp is
// generated once when this module is first required and reused for all
// subsequent calls so that every test writes into the same file.
const logsDir = path.join(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filePath = path.join(logsDir, `${runTimestamp}.log`);
let stream = fs.createWriteStream(filePath, { flags: 'a' });

function start(testTitle) {
  if (!stream) {
    // In case the stream was manually closed, recreate it using the same
    // run timestamp so all logs for this execution stay in one file.
    stream = fs.createWriteStream(filePath, { flags: 'a' });
  }
  stream.write(`${new Date().toISOString()} - Test: ${testTitle}\n`);
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
