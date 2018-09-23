import React from 'react';
import { base64Sync } from 'base64-img';

const makeImageSource = (path, embed) => {
    if (embed) {
        try {
            return base64Sync(path);
        } catch (e) {
            //do nothing   
        }
    }
    return path;
}

const ImagesContainer = props => {
    const { test } = props;
    return (
        <div className={`tile ${test.screenshots.length === 0 ? `no-screenshots` : `screenshots`}`}>
            <div className="screenshots-scroll-container">
                {
                    test.screenshots.map((screenshot, index) => {
                        return (
                            <img key={index} className="screenshot-img" src={ makeImageSource(screenshot, test.embedScreenshots) } />    
                        )
                    })
                }
            </div>
        </div>
    )
}

export default ImagesContainer;