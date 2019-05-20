import React from 'react';
import TestsResults from './tests-results';
import { makeId, LinkableHeaderH4 } from './linkable-header';

const SuitesResults = props => {
  const { suites } = props;
  return suites.map(item => {
    const id = makeId(item.title);

    return (
      <div className="box suites-results" data-box-is="suite">
        <LinkableHeaderH4 styleName={'subtitle'} level={4} id={id}>
          {item.title}
        </LinkableHeaderH4>
        <TestsResults tests={item.tests} />
      </div>
    );
  });
};

export default SuitesResults;
