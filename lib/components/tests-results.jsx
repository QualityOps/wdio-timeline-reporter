import React from 'react';
import Error from './error';
import AdditionalContext from './additional-context';
import { base64Sync } from 'base64-img';


const makeImageSource = (path, embed) => {
    if (embed) {
        try {
            return base64Sync(path);
        } catch (e) {
            //do nothing   
        }
    }
    return path;
}

const TestTitle = props => {
    const stateClassnameAndMessage = {
        pending: { classname: 'is-warning', message: 'Skipped' },
        pass: { classname: 'is-primary', message: 'Passed' },
        fail: { classname: 'is-danger', message: 'Failed' },
    }
    const { state } = props;
    const classNameAndFieldText = stateClassnameAndMessage[state];
    return (
        <span className={`tag ${classNameAndFieldText.classname}`}>{ classNameAndFieldText.message }</span>   
    )
};

const getBrowserFontIconClass = browser => {
    const supported = ['chrome', 'ie', 'edge', 'firefox'];
    return supported.includes(browser) ? `fa-${browser}` : '';
}

const TestsResults = props => {
    const { tests } = props;
    return tests.map((test, index) => {
        return (
            <div key={index} className={`test ${test.state}`}>
                <p className="subtitle is-5">
                    <TestTitle state={ test.state } /> { test.title }
                </p>
                { test.state !== 'pending' ?
                    (
                        <div className="columns">
                            <div className="column is-half">
                                <table className="table is-striped is-fullwidth is-bordered">
                                    <tr>
                                        <td>Browser:</td>
                                        <td>{test.browser} <i className={`fab ${getBrowserFontIconClass(test.browser)}`}></i></td>
                                    </tr>
                                    <tr>
                                        <td>Duration:</td>
                                        <td>{test.duration}</td>
                                    </tr>
                                    <tr>
                                        <td>Start:</td>
                                        <td>{test.start}</td>
                                    </tr>
                                    <tr>
                                        <td>End:</td>
                                        <td>{test.end}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    ) : null
                }
                <div className={`tile ${test.screenshots.length === 0 ? `no-screenshots` : `screenshots`}`}>
                    <div className="screenshots-scroll-container">
                        {
                            test.screenshots.map((screenshot, index) => {
                                return (
                                    <img key={index} className="screenshot-img" src={ makeImageSource(screenshot, test.embedScreenshots) } />    
                                )
                            })
                        }
                    </div>
                </div>
                <Error state={test.state} error={test.error}/>
                <AdditionalContext context={test.context}/>
            </div>        
        )
    })
};

export default TestsResults;