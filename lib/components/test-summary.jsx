import React from 'react';

const getBrowserFontIconClass = browser => {
    const supported = ['chrome', 'ie', 'edge', 'firefox'];
    return supported.includes(browser) ? `fa-${browser}` : '';
}

const TestSummary = props => {
    const { test } = props;
    return test.state !== 'pending' ?
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

export default TestSummary;