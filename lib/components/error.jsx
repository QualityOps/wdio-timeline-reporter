import React from 'react';

const Error = props => {
    const { state, error } = props;
    const failedAndErrorMessageAvailable = state === 'fail' && error;
    return failedAndErrorMessageAvailable ?
        (<details>
            <summary>ERROR LOG</summary>
            <table className="table is-striped is-bordered is-fullwidth">
                {!!error.type &&
                    <tr>
                        <td>Type:</td>
                        <td>{type}</td>
                    </tr>
                }
                {!!error.message &&
                    <tr>
                        <td>Message:</td>
                        <td>{error.message.replace(/<|>/g, '')}</td>
                    </tr>
                }
                {!!error.stack &&
                    <tr>
                        <td>Stack:</td>
                        <td>{error.stack.replace(/<|>/g, '')}</td>
                    </tr>
                }
            </table>
        </details>) : null;
};

export default Error;