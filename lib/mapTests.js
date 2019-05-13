const humanizeDuration = require('humanize-duration');

module.exports = function(suiteTests) {
  let tests = [];
  /** Add Test Info */
  for (let testName of Object.keys(suiteTests)) {
    const test = suiteTests[testName];
    const testCase = {};

    testCase.name = test.title;
    testCase.start = test.start;
    testCase.end = test.end;
    testCase.duration = humanizeDuration(test._duration);
    testCase.state = test.state;

    if (test.error) {
      if (test.error.type) {
        testCase.errorType = test.error.type;
      }
      if (test.error.message) {
        testCase.error = test.error.message;
      }
      if (test.error.stack) {
        testCase.standardError = test.error.stack;
      }
    }

    tests.push(testCase);
  }
  return tests;
};
