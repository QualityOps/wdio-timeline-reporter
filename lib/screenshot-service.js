import path from 'path';
import { deepMerge } from './utils';
import fs from 'fs';
import { waitForFileExistsAndResize } from './utils';

const VERBOSE = 'verbose';
const ERROR = 'error';
const DEFAULT_DIRECTORY = './';

class ScreenshotService {
  constructor() {
    this.screenshotServiceOptions = null;
    this.screenshotList = [];
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
        reductionRatio: 1
      },
      strategy: 'none'
    };
    return deepMerge(defaultOptions, config.screenshotService || {});
  }

  takeScreenshot() {
    try {
      const filename = Date.now().toString();
      const filePath = path.resolve(
        this.screenshotServiceOptions.outputDir,
        `${filename}.jpeg`
      );
      browser.saveScreenshot(filePath);
      this.screenshotList.push(filePath);
    } catch (e) {}
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

  after() {
    let {
      resize,
      quality,
      reductionRatio
    } = this.screenshotServiceOptions.images;
    if (resize) {
      console.log(
        `TIMELINE:ScreenshotService: Attempting to resize ${
          this.screenshotList.length
        } images`
      );
      quality =
        Number.isInteger(quality) && quality > 0 && quality <= 100
          ? Math.round(quality)
          : 70;
      reductionRatio =
        Number.isInteger(reductionRatio) &&
        reductionRatio > 0 &&
        reductionRatio <= 5
          ? Math.round(reductionRatio)
          : 1;
      const promises = this.screenshotList.map(filePath =>
        Promise.resolve(
          waitForFileExistsAndResize(filePath, quality, reductionRatio)
        )
      );
      return browser.call(() => Promise.all(promises));
    }
  }
}

module.exports = new ScreenshotService();
