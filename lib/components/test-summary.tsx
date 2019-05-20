import React from 'react';
import humanizeDuration from 'humanize-duration';

export const getBrowserFontIconClass = browser => {
  var supported = ['chrome', 'ie', 'edge', 'firefox'];
  var filtered = supported.filter(item => browser.includes(item));
  console.log('browser is', browser, filtered);
  if (filtered.length > 0) {
    return 'fa-' + filtered[0];
  }
};

const TestSummary = props => {
  const { test } = props;
  return test.state !== 'pending' ? (
    <div className="columns">
      <div className="column is-half">
        <table className="table is-striped is-fullwidth is-bordered">
          {/* <tr>
            <td>Browser:</td>
            <td>
              {test.browser}{' '}
              <i className={`fab ${getBrowserFontIconClass(test.browser)}`} />
            </td>
          </tr> */}
          <tr>
            <td>Duration:</td>
            <td>{humanizeDuration(test.duration, { round: true })}</td>
          </tr>
          <tr>
            <td>Start:</td>
            <td>{test.start}</td>
          </tr>
          <tr>
            <td>End:</td>
            <td>{test.end}</td>
          </tr>
        </table>
      </div>
    </div>
  ) : null;
};

export default TestSummary;
