import React from 'react';
import fs from 'fs';
import { basename } from 'path';

const makeImageSource = (path, embed) => {
  if (embed) {
    try {
      const buffer = fs.readFileSync(path);
      let base64data = buffer.toString('base64');
      return `data:image/jpeg;base64,${base64data}`;
    } catch (e) {
      //do nothing
    }
  }
  return `./${basename(path)}`;
};

const ImagesContainer = props => {
  const { test } = props;
  return (
    <div
      className={`tile ${
        test.screenshots.length === 0 ? `no-screenshots` : `screenshots`
      }`}
    >
      <div className="screenshots-scroll-container">
        {test.screenshots.map((screenshot, index) => {
          return (
            <img
              key={index}
              data-count={index + 1}
              className="screenshot-img"
              src={makeImageSource(screenshot, test.embedImages)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ImagesContainer;
