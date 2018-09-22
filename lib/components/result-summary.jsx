import React from 'react';

const ResultsSummary = props => {
  const { total, passed, failed, skipped, duration } = props;
  return (
    <section className="section has-background-light">
      <div className="container">
        <div className="columns has-text-centered">
          <div className="column">
            <div className="notification is-link">
              <h1 className=" title is-size-10">Total</h1>
              <h1 className=" title is-size-8">{ total }</h1>
            </div>
          </div>
          <div className="column">
            <div className="notification is-primary">
              <h1 className=" title is-size-10">Passed</h1>
              <h1 className=" title is-size-8">{ passed }</h1>
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
              <h1 className=" title is-size-8">{ skipped }</h1>
            </div>
          </div>
        </div>
        <h3 className="title is-4">Total Duration: { duration }</h3>
      </div>
    </section>
  );
};

export default ResultsSummary;
