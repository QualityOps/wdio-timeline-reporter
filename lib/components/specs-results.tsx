import React from 'react';
import SuiteResults from './suites-results';
import humanizeDuration from 'humanize-duration';
import { getBrowserFontIconClass } from './test-summary';

const getBrowserNameAndCombo = (capabilities) => {
    const name =
      capabilities.browserName ||
      capabilities.deviceName ||
      'unknown browser name';
    const version =
      capabilities.browserVersion ||
      capabilities.platformVersion ||
      capabilities.version ||
      'unknown browser version';
    return `${name} ${version}`;
  }

const SpecsResults = props => {
  const { specs } = props;
  return specs.map(spec => {
    const {capabilities: {browserName, platformName, platformVersion, deviceModel, deviceManufacturer}} = spec;
    return (
      <div className="box" data-box-is="spec">
        <h4 className="title is-4">
          <span className="has-text-grey-light">Spec:</span> {spec.filename}{' '}
        </h4>
        <h4 className="title is-4">
          <span className="has-text-grey-light">Duration:</span>{' '}
          {humanizeDuration(spec.duration, { round: true })}
        </h4>
        {platformName && <h4 className="title is-4">
          <span className="has-text-grey-light">Platform: </span>
          {platformVersion ? `${platformName} ${platformVersion}`: platformName}
        </h4>}
        {deviceModel && deviceManufacturer && <h4 className="title is-4">
          <span className="has-text-grey-light">Model: </span>
          {`${deviceManufacturer}: ${deviceModel}`}
        </h4>}
        <h4 className="title is-4">
          <span className="has-text-grey-light">Browser: </span>
          <span className="has-text-grey-light">
            <i className={`fab ${getBrowserFontIconClass(browserName)}`} />
          </span> {getBrowserNameAndCombo(spec.capabilities)}
        </h4>
        <SuiteResults suites={spec.suites} />
      </div>
    );
  });
};

export default SpecsResults;
