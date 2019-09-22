import React from 'react';
import NoResults from './no-results';
import SpecsResults from './specs-results';
import Search from './search';

const Results = props => {
  return (
    <div className="container">
      <Search />
      <NoResults />
      <div id="results" className="tests all">
        <SpecsResults specs={props.specs} />
      </div>
    </div>
  );
};

export default Results;
