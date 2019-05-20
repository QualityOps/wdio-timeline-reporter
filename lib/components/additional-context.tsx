import React from 'react';

const linkOrPlainText = item => {
    return item.value.startsWith('<a') ? (
        <div dangerouslySetInnerHTML={{ __html: item.value }} />
    ) : item.value
}

const AdditionalContext = props => {
    const { context } = props;
    return !!context ?
        (
            <details>
                <summary className="subtitle has-text-danger">Additional Context</summary>
                <table className="table is-striped is-bordered is-fullwidth">
                    {
                        context.map((item, index) => {
                            return typeof item === 'string' ? (
                                <tr key={index}>
                                    <td></td>
                                    <td>{item}</td>
                                </tr>
                            ) : typeof item === 'object' ?
                                    (
                                        <tr key={index}>
                                            <td>{item.title}:</td>
                                            <td>{linkOrPlainText(item)}</td>
                                        </tr>
                                    )
                                    : null
                        })
                    }
                </table>
            </details>
        ) : null;
};

export default AdditionalContext;