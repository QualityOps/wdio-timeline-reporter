import React from 'react';
import Filter from './filter';
import SpecsResults from './specs-results';

const Results = props => {
  return (
    <div className="container">
      <Filter />
      <div id="results" className="tests all">
        <SpecsResults specs={props.specs} />
      </div>
    </div>
  );
};

export default Results;
