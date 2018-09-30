import React from 'react';
import SuiteResults from './suites-results';

const SpecsResults = props => {
    const { specs } = props;
    return (
        specs.map(item => {
            return (
                <div className="box" data-box-is="spec">
                    <h4 className="title is-4">Spec: { item.filename } ({ item.duration })</h4>
                    <SuiteResults suites={ item.suites }/> 
                </div>
            )
        })
        
        // <SuiteResults />
    );
};

export default SpecsResults;