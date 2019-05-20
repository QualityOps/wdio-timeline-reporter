import React from 'react';

const Warning = props => {
    return props.state === 'unknown' ?
    (
        <article className="message is-warning">
            <div className="message-body">
            Test returned without a status. Have you focused on a different test in suite using fit in Jasmine?
            </div>
        </article>
    ) : null
}

export default Warning;