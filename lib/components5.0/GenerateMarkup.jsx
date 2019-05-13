import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Modal from './Modal';
import ResultSummary from './ResultSummary';
import Results from './Results';
import Footer from './Footer';
import PropTypes from 'prop-types';

export const generateMarkup = props => {
  const { summary } = props;
  return renderToStaticMarkup(
    <div>
      <Modal />
      <ResultSummary {...summary} />
      <Results {...props} />
      <Footer />
    </div>
  );
};
