import React from 'react'

const Filter = () => {
    return (
        <div className="columns">
            <div className="column is-half">
                <div id="filter" className="buttons has-addons">
                    <span className="button is-link is-selected">All</span>
                    <span className="button">Passed</span>
                    <span className="button">Failed</span>
                    <span className="button">Skipped</span>
                </div>
            </div>
        </div>
    );
}

export default Filter;