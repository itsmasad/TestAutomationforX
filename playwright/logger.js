const fs = require('fs');
const path = require('path');

let stream = null;

function start(testTitle) {
  const logsDir = path.join(__dirname, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(logsDir, `${timestamp}.log`);
  stream = fs.createWriteStream(filePath, { flags: 'a' });
  stream.write(`${new Date().toISOString()} - Test: ${testTitle}\n`);
}

function log(message) {
  if (stream) {
    stream.write(`${new Date().toISOString()} - ${message}\n`);
  }
}

function end() {
  if (stream) {
    stream.end();
    stream = null;
  }
}

module.exports = { start, log, end };
