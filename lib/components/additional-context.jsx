import React from 'react';

const AdditionalContext = props => {
    const { context } = props;
    return !!context ? 
    (
        <details>
            <summary>ADDITIONAL CONTEXT</summary>
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
                                    <td>{ item.title}:</td>
                                    <td>{ item.value}</td>
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