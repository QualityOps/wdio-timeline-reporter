import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Modal from './modal';
import ResultSummary from './result-summary';
import Results from './results'
import Footer from './footer'

export const generateMarkup = (props) => {
    const { summary } = props;
    return renderToStaticMarkup(
        <div>
            <Modal />
            <ResultSummary { ...summary }/>
            <Results {...props} />
            <Footer />
        </div>
    )
}

