export interface State {
  passed: number;
  failed: number;
  skipped: number;
}

export interface ResultSet {
  start?: string;
  end?: string;
  capabilities?: {};
  host?: string;
  port?: any;
  baseUrl?: string;
  waitForTimeout?: any;
  framework?: string;
  mochaOpts?: string;
  duration?: number;
  suites?: any[];
  specs?: any[];
  state?: State;
}

export const initResultSet = (runner: any) => {
  let resultSet: ResultSet = {};

  resultSet.start = runner.start;
  resultSet.end = runner.end;
  resultSet.capabilities = runner.capabilities;
  resultSet.host = runner.config.hostname;
  resultSet.port = runner.config.port;
  resultSet.baseUrl = runner.config.baseUrl;
  resultSet.waitForTimeout = runner.config.waitForTimeout;
  resultSet.framework = runner.config.framework;
  resultSet.mochaOpts = runner.config.mochaOpts;
  resultSet.duration = runner.duration;
  resultSet.suites = [];
  resultSet.specs = [];
  resultSet.state = { passed: 0, failed: 0, skipped: 0 };

  return resultSet;
};
