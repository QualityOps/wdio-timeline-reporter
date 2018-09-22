import React from 'react';
import TestsResults from './tests-results';

const SuitesResults = props => {
    const { suites } = props;
    return (
        suites.map(item => {
            return (
                <div className="box">
                    <h4 className="subtitle is-4">{ item.title }</h4>
                    <TestsResults tests={ item.tests }/> 
                </div>
            )
        })
    )
};

export default SuitesResults;