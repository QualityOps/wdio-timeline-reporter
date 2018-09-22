import React from 'react'

const Filter = () => {
    return (
        <div className="columns">
            <div className="column is-half">
                <div className="field">
                    <div id="filter" className="control">
                        <label className="radio">
                            <input type="radio" name="question" value="all" defaultChecked /> All 
                        </label>
                        <label className="radio">
                            <input type="radio" name="question" value="passed" /> Passed
                        </label>
                        <label className="radio">
                            <input type="radio" name="question" value="failed" /> Failed
                        </label>
                        <label className="radio">
                            <input type="radio" name="question" value="pending" /> Skipped
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Filter;