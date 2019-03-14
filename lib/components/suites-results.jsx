import React from 'react';
import TestsResults from './tests-results';
import LinkableHeader, { makeId } from './linkable-header';

const SuitesResults = props => {
    const { suites } = props;
    return (
        suites.map(item => {
            const id = makeId(item.title);

            return (
                <div className="box suites-results" data-box-is="suite">
                    <LinkableHeader styleName={'subtitle'} level={4} id={id}>{ item.title }</LinkableHeader>
                    <TestsResults tests={ item.tests }/>
                </div>
            )
        })
    )
};

export default SuitesResults;
