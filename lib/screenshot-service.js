import path from 'path';
import Jimp from 'jimp';
import merge from 'deepmerge';
import fs from 'fs-extra';
import { waitUntilFileExists, resizeImage } from './utils'

const VERBOSE = 'verbose';
const ERROR = 'error';
const DEFAULT_DIRECTORY = './'

class ScreenshotService {
    constructor() {
        this.screenshotServiceOptions = null;
    }

    beforeSession(config, capabilities, specs) {
        this.screenshotServiceOptions = this.setScreenshotServiceOptions(config);
        const outputDir = this.screenshotServiceOptions.outputDir;
        try {
            !fs.existsSync(path.resolve(outputDir)) && fs.mkdirSync(outputDir);
        } catch (e) {
            console.log(`TIMELINE:ScreenshotService:\ne`);
            this.screenshotServiceOptions.outputDir = DEFAULT_DIRECTORY;
        }
    }

    setScreenshotServiceOptions(config) {
        const defaultOptions = {
            outputDir: DEFAULT_DIRECTORY,
            images: {
                quality: 70,
                resize: false,
                reductionRatio: 1,
            },
            strategy: 'none'
        }
        return merge(defaultOptions, config.screenshotService || {});
    }

    takeScreenshot() {
        const filename = Date.now().toString();
        const filePath = path.resolve(this.screenshotServiceOptions.outputDir, `${filename}.jpeg`);
        browser.saveScreenshot(filePath);

        let { resize, quality, reductionRatio } = this.screenshotServiceOptions.images;
        quality = (Number.isInteger(quality) && quality > 0 && quality <= 100) ? Math.round(quality) : 70;
        reductionRatio = (Number.isInteger(reductionRatio) && reductionRatio > 0 && reductionRatio <= 5) ? Math.round(reductionRatio) : 5;
        if (resize) {
            browser.call(function () {
                return waitUntilFileExists(filePath, 1500)
                    .then(file => resizeImage(file, quality, reductionRatio))
                    .catch(err => console.log('TIMELINE:ScreenshotService:' + err))
            });
        }
    }



    beforeCommand(commandName, args) {
        const { strategy } = this.screenshotServiceOptions;
        if (strategy === VERBOSE && 'click' === commandName) {
            this.takeScreenshot();
        }
    }

    afterTest(test) {
        const { strategy } = this.screenshotServiceOptions;
        if (strategy === VERBOSE) {
            this.takeScreenshot();
        }
        if (strategy === ERROR && !test.passed) {
            this.takeScreenshot();
        }
    }
}

module.exports = new ScreenshotService();
