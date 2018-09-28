import React from 'react';

const Warning = props => {
    return props.state === 'unknown' ?
    (
        <article className="message is-danger">
            <div className="message-body">
            Something went wrong and some tests returned without a status. Are you running any tests with
            </div>
        </article>
    ) : null
}

export default Warning;