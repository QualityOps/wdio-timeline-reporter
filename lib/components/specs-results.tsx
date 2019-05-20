import React from 'react';
import SuiteResults from './suites-results';
import humanizeDuration from 'humanize-duration';
import { getBrowserFontIconClass } from './test-summary';

const SpecsResults = props => {
  const { specs } = props;
  return specs.map(spec => {
    return (
      <div className="box" data-box-is="spec">
        <h4 className="title is-4">
          <span className="has-text-grey-light">Spec:</span> {spec.filename}{' '}
        </h4>
        <h4 className="title is-4">
          <span className="has-text-grey-light">Duration:</span>{' '}
          {humanizeDuration(spec.duration, { round: true })}
        </h4>
        <h4 className="title is-4">
          <span className="has-text-grey-light">Browser: </span>
          <span className="has-text-grey-light">
            <i className={`fab ${getBrowserFontIconClass(spec.browser)}`} />
          </span> {spec.browser}
        </h4>
        <SuiteResults suites={spec.suites} />
      </div>
    );
  });
};

export default SpecsResults;
