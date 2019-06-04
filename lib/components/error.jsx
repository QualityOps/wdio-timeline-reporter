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
                        <td>{error.type}</td>
                    </tr>
                }
                {!!error.message &&
                    <tr>
                        <td>Message:</td>
                        <td style={{ display: 'grid' }}>
                            <pre>{error.message.replace(/<|>/g, '')}</pre>
                        </td>
                    </tr>
                }
                {!!error.stack &&
                    <tr>
                        <td>Stack:</td>
                        <td style={{ display: 'grid' }}>
                            <pre>{error.stack.replace(/<|>/g, '')}</pre>
                        </td>
                    </tr>
                }
            </table>
        </details>) : null;
};

export default Error;