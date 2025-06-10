const fs = require('fs');
const path = require('path');

class CustomReporter {
  onBegin(config) {
    this.results = [];
    this.startTime = Date.now();
    this.browser = config.projects[0].use.browserName || 'chromium';
    this.environment = process.env.CURRENT_ENV || 'staging';
  }

  onTestEnd(test, result) {
    const attachments = result.attachments || [];
    const shot = attachments.find(a => a.name === 'screenshot');
    const screenshot = shot ? path.relative(process.cwd(), shot.path) : undefined;
    const info = {
      id: test.id,
      title: test.title,
      outcome: result.status,
      duration: result.duration,
      description: test.title,
      screenshot,
    };

    if (result.error) {
      info.errorMessage = result.error.message;
      const stack = result.error.stack || '';
      const match = stack.match(/(\S+\.js):(\d+):(\d+)/);
      if (match) {
        const file = match[1];
        const line = parseInt(match[2], 10);
        info.failureLocation = { file: path.relative(process.cwd(), file), line };
        try {
          const lines = fs.readFileSync(file, 'utf-8').split('\n');
          info.codeSnippet = lines.slice(Math.max(0, line - 2), line + 1).join('\n');
        } catch (e) {
          // ignore read errors
        }
      }
    }

    this.results.push(info);
  }

  onEnd() {
    const totalTime = Date.now() - this.startTime;
    const summary = this.results.reduce((acc, r) => {
      acc[r.outcome] = (acc[r.outcome] || 0) + 1;
      return acc;
    }, {});

    const byOutcome = this.results.reduce((acc, r) => {
      if (!acc[r.outcome]) acc[r.outcome] = [];
      acc[r.outcome].push(r);
      return acc;
    }, {});

    const report = {
      environment: this.environment,
      browser: this.browser,
      totalTime,
      summary,
      tests: this.results,
      byOutcome,
    };

    const dir = path.join(__dirname, 'report');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'report.json');
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
    console.log(`Custom report written to ${file}`);
  }
}

module.exports = CustomReporter;
