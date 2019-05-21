import React from 'react';
import Error from './error';
import AdditionalContext from './additional-context';
import Warning from './warning';
import TestSummary from './test-summary';
import ImagesContainer from './images-container';
import { makeId, LinkableHeaderH5 } from './linkable-header';

const TestTitle = props => {
  const stateClassnameAndMessage = {
    pending: { span: 'has-text-warning', icon: 'fa-question' },
    skipped: { span: 'has-text-warning', icon: 'fa-forward' },
    passed: { span: 'has-text-primary', icon: 'fa-check-square' },
    failed: { span: 'has-text-danger', icon: 'fa-ban' },
    unknown: { span: 'has-text-warning', icon: 'fa-question-circle' }
  };
  const { state } = props;
  const classNameAndFieldText = stateClassnameAndMessage[state || 'unknown'];
  return (
    <span className={`icon ${classNameAndFieldText.span}`}>
      <i className={`fas ${classNameAndFieldText.icon}`} />
    </span>
  );
};

const TestsResults = props => {
  const { tests } = props;
  return tests.map((test, index) => {
    const id = makeId(test.title);

    return (
      <div key={index} className={`box test ${test.state}`}>
        <LinkableHeaderH5 level={5} id={id}>
          <TestTitle state={test.state} /> {test.title}
        </LinkableHeaderH5>
        {test.state === 'pending' ? (
          <span className="tag is-warning" style={{ marginBottom: '18px' }}>
            Failed mocha test configured to retry. Check spec result for final
            test run
          </span>
        ) : null}
        <TestSummary test={test} />
        <Warning state={test.state} />
        <ImagesContainer test={test} />
        <Error state={test.state} error={test.error} />
        <AdditionalContext context={test.context} />
      </div>
    );
  });
};

export default TestsResults;
