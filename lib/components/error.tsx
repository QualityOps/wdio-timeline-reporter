import React from 'react';

const Error = props => {
  const { state, error } = props;
  const failedAndErrorMessageAvailable = state === 'failed' && error;
  return failedAndErrorMessageAvailable ? (
    <details>
      <summary className="subtitle has-text-danger">Error Log</summary>
      <table className="table is-striped is-bordered is-fullwidth">
        {!!error.type && (
          <tr>
            <td>Type:</td>
            <td>{error.type}</td>
          </tr>
        )}
        {!!error.message && (
          <tr>
            <td>Message:</td>
            <td style={{ display: 'grid' }}>
              <pre className="stack has-background-grey-dark has-text-white-bis">
                {error.message.replace(/<|>/g, '')}
              </pre>
            </td>
          </tr>
        )}
        {!!error.stack && (
          <tr>
            <td>Stack:</td>
            <td style={{ display: 'grid' }}>
              <pre className="stack has-background-grey-dark has-text-white-bis">
                {error.stack.replace(/<|>/g, '')}
              </pre>
            </td>
          </tr>
        )}
      </table>
    </details>
  ) : null;
};

export default Error;
