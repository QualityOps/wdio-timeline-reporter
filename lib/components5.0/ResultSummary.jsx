import React from 'react';
import PropTypes from 'prop-types';

const ResultsSummary = props => {
  const { total, passed, failed, skipped, duration, unknown } = props;
  return (
    <section className="section has-background-light">
      <div className="container">
        <div className="columns has-text-centered">
          <div className="column">
            <div className="notification is-link">
              <h1 className=" title is-size-10">Total</h1>
              <h1 className=" title is-size-8">{total}</h1>
            </div>
          </div>
          <div className="column">
            <div className="notification is-primary">
              <h1 className=" title is-size-10">Passed</h1>
              <h1 className=" title is-size-8">{passed}</h1>
            </div>
          </div>
          <div className="column">
            <div className="notification is-danger">
              <h1 className=" title is-size-10">Failed</h1>
              <h1 className=" title is-size-8">{failed}</h1>
            </div>
          </div>
          <div className="column">
            <div className="notification is-warning">
              <h1 className=" title is-size-10">Skipped</h1>
              <h1 className=" title is-size-8">{skipped}</h1>
            </div>
          </div>
          {!!unknown ? (
            <div className="column">
              <div className="notification">
                <h1 className=" title is-size-10">Unknown</h1>
                <h1 className=" title is-size-8">{unknown}</h1>
              </div>
            </div>
          ) : null}
        </div>
        <h3 className="title is-4">Total Duration: {duration}</h3>
      </div>
    </section>
  );
};

ResultsSummary.propTypes = {
  total: PropTypes.number,
  passed: PropTypes.number,
  skipped: PropTypes.number,
  failed: PropTypes.number,
  duration: PropTypes.string,
  unknown: PropTypes.number
};

export default ResultsSummary;
