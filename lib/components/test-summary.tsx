import React from 'react';
import humanizeDuration from 'humanize-duration';
import { formatDateString } from '../utils';

export const getBrowserFontIconClass = browser => {
  var supported = ['chrome', 'ie', 'edge', 'firefox'];
  var filtered = supported.filter(item => browser.includes(item));
  if (filtered.length > 0) {
    return 'fa-' + filtered[0];
  }
};

const TestTitle = props => {
  const stateClassnameAndMessage = {
    pending: { span: 'is-warning', status: 'PENDING' },
    skipped: { span: 'is-warning', status: 'SKIPPED' },
    passed: { span: 'is-success', status: 'PASSED' },
    failed: { span: 'is-danger', status: 'FAILED' },
    unknown: { span: 'is-warning', status: 'UNKNOWN' }
  };
  const { state } = props;
  const classNameAndFieldText = stateClassnameAndMessage[state || 'unknown'];
  return (
    <span className={`tag is-normal ${classNameAndFieldText.span}`}>
      {classNameAndFieldText.status}
    </span>
  );
};

const TestSummary = props => {
  const { test } = props;
  return test.state !== 'pending' ? (
    <div className="columns">
      <div className="column is-half">
        <table className="table is-hoverable">
          {/* <tr>
            <td>Browser: </td>
            <td>
              <i className={`fab ${getBrowserFontIconClass(test.browser)}`} />
            </td> {test.browser}
          </tr> */}
          <tr>
            <td>Status:</td>
            <td>
              <TestTitle state={test.state} />
            </td>
          </tr>
          <tr>
            <td>Duration:</td>
            <td>{humanizeDuration(test.duration, { round: true })}</td>
          </tr>
          <tr>
            <td>Start:</td>
            <td>{formatDateString(test.start)}</td>
          </tr>
          <tr>
            <td>End:</td>
            <td>{formatDateString(test.end)}</td>
          </tr>
        </table>
      </div>
    </div>
  ) : null;
};

export default TestSummary;
