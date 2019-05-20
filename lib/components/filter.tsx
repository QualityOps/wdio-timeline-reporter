import React from 'react'

const Filter = () => {
    return (
        <div className="columns">
            <div className="column is-half">
                <div id="filter" className="buttons has-addons">
                    <span className="button is-link is-selected" data-status="all">All</span>
                    <span className="button" data-status="passed">Passed</span>
                    <span className="button" data-status="failed">Failed</span>
                    <span className="button" data-status="skipped">Skipped</span>
                </div>
            </div>
        </div>
    );
}

export default Filter;