import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Modal from './modal';
import ResultSummary from './result-summary';
import Results from './results';
import Footer from './footer';

const style = {
  paddingBottom: 25
};

export const generateMarkup = props => {
  const { summary } = props;
  return renderToStaticMarkup(
    <div>
      <Modal />
      <section className="section has-background-light" style={style}>
        <ResultSummary {...summary} />
        <Results {...props} />
      </section>
      <Footer />
    </div>
  );
};
