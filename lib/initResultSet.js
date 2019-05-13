const humanizeDuration = require('humanize-duration');

module.exports = function(runner) {
  let resultSet = {};

  resultSet.start = runner.start;
  resultSet.end = runner.end;
  resultSet.capabilities = runner.capabilities;
  resultSet.host = runner.config.hostname;
  resultSet.port = runner.config.port;
  resultSet.baseUrl = runner.config.baseUrl;
  resultSet.waitForTimeout = runner.config.waitForTimeout;
  resultSet.framework = runner.config.framework;
  resultSet.mochaOpts = runner.config.mochaOpts;
  resultSet.duration = humanizeDuration(runner.config.duration);
  resultSet.suites = [];
  resultSet.specs = [];
  resultSet.state = { passed: 0, failed: 0, skipped: 0 };

  return resultSet;
};
