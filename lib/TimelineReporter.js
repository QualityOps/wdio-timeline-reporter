import * as WDIOReporter from '@wdio/reporter';

class TimelineReporter extends WDIOReporter {
  constructor(options) {
    options = Object.assign(options, { stdout: false });
    super(options);
  }

  onTestStart(test) {
    this.test = test;
    this.test.screenshots = [];
  }

  onAfterCommand(command) {
    if (
      command.endpoint.includes('screenshot') &&
      command.result &&
      command.result.value
    ) {
      try {
        const filepath = `./output/file-${Date.now()}.png`;
        var wstream = fs.createWriteStream(filepath);
        wstream.write(Buffer.from(command.result.value, 'base64'));
        wstream.end();
        this.test.screenshots.push(filepath);
      } catch (error) {
        // do nothing
      }
    }
  }

  onRunnerEnd(runner) {
    let json = this.prepareJson(runner);
    this.write(JSON.stringify(json, null, 2));
  }

  prepareJson(runner) {
    var resultSet = initResultSet(runner);

    for (let specId of Object.keys(runner.specs)) {
      resultSet.specs.push(runner.specs[specId]);
      for (let suiteKey of Object.keys(this.suites)) {
        const suite = this.suites[suiteKey];
        let testSuite = {};
        testSuite.name = suite.title;
        testSuite.duration = humanizeDuration(suite._duration);
        testSuite.start = suite.start;
        testSuite.end = suite.end;
        testSuite.tests = MapTests(suite.tests);
        testSuite.hooks = MapHooks(suite.hooks);

        resultSet.state.failed += testSuite.hooks.filter(
          hook => hook.error
        ).length;
        resultSet.state.passed += testSuite.tests.filter(
          test => test.state === 'passed'
        ).length;
        resultSet.state.failed += testSuite.tests.filter(
          test => test.state === 'failed'
        ).length;
        resultSet.state.skipped += testSuite.tests.filter(
          test => test.state === 'skipped'
        ).length;
        resultSet.suites.push(testSuite);
      }
    }

    return resultSet;
  }
}
