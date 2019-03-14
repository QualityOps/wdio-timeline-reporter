import React from 'react';
import Error from './error';
import AdditionalContext from './additional-context';
import Warning from './warning';
import TestSummary from './test-summary';
import ImagesContainer from './images-container';
import LinkableHeader, { makeId } from './linkable-header';

const TestTitle = props => {
    const stateClassnameAndMessage = {
        pending: { classname: 'is-warning', message: 'Skipped' },
        pass: { classname: 'is-primary', message: 'Passed' },
        fail: { classname: 'is-danger', message: 'Failed' },
        unknown: { classname: 'is-warning', message: 'Unknown' },
    }
    const { state } = props;
    const classNameAndFieldText = stateClassnameAndMessage[state];
    return (
        <span className={`tag ${classNameAndFieldText.classname}`}>{ classNameAndFieldText.message }</span>
    )
};

const TestsResults = props => {
    const { tests } = props;
    return tests.map((test, index) => {
        const id = makeId(test.title);

        return (
            <div key={index} className={`box test ${test.state}`}>
                <LinkableHeader level={5} id={id}>
                    <TestTitle state={ test.state } /> { test.title }
                </LinkableHeader>
                <TestSummary test={test} />
                <Warning state={test.state} />
                <ImagesContainer test={test} />
                <Error state={test.state} error={test.error}/>
                <AdditionalContext context={test.context}/>
            </div>
        )
    })
};

export default TestsResults;
