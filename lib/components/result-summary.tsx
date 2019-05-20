import React from 'react';
import humanizeDuration from 'humanize-duration';

const ResultsSummary = props => {
  const { total, passed, failed, skipped, duration, unknown } = props;
  return (
    <div className="container">
      <h3 className="title is-3">
        <span className="has-text-grey-light">Total Duration:</span>{' '}
        {humanizeDuration(duration, { round: true })}
      </h3>
      <div className="columns">
        <div className="column">
          <div className="notification is-link">
            <h1 className="title is-size-2">{total}</h1>
            <p className="title is-size-4">Total</p>
          </div>
        </div>
        <div className="column">
          <div className="notification is-primary">
            <h1 className=" title is-size-2">{passed}</h1>
            <p className="title is-size-4">Passed</p>
          </div>
        </div>
        <div className="column">
          <div className="notification is-danger">
            <h1 className="title is-size-2">{failed}</h1>
            <p className="title is-size-4">Failed</p>
          </div>
        </div>
        <div className="column">
          <div className="notification is-warning">
            <h1 className="title is-size-2">{skipped}</h1>
            <p className="title is-size-4">Skipped</p>
          </div>
        </div>
        {!!unknown ? (
          <div className="column">
            <div className="notification">
              <h1 className="title is-size-2">{unknown}</h1>
              <p className="title is-size-4">Unknown</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResultsSummary;
