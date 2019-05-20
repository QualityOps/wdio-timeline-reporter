import {
  existsSync,
  mkdirSync,
  writeFileSync,
  watch,
  appendFileSync,
  readFileSync,
  writeFile
} from 'fs';
import { resolve, sep, isAbsolute } from 'path';
import { generateMarkup } from './components/generate-markup';
import indexHtml from './index-template';
import { waitForFileExistsAndResize, deepSearch } from './utils';
import { promisify } from 'util';
import { ReporterOptions } from './timeline-reporter';

const writeFilePromiseSync = promisify(writeFile);

const BEFORE_CLICK = 'before:click';
const ON_ERROR = 'on:error';

declare var browser: any;

export class TimelineService {
  reporterOptions: ReporterOptions;
  resolvedOutputDir: string;
  changeLogFile: string;

  constructor() {
    // this.reporterOptions = {};
    // this.resolvedOutputDir = undefined;
    // this.changeLogFile = undefined;
  }

  setReporterOptions(config) {
    const timeline = config.reporters.filter(
      item => Array.isArray(item) && item[0] === 'timeline'
    );
    this.reporterOptions = timeline[0][1];
    this.resolvedOutputDir = resolve(this.reporterOptions.outputDir);
  }

  onPrepare(config) {
    this.setReporterOptions(config);

    try {
      // mkdir recursively
      const initDir = isAbsolute(this.resolvedOutputDir) ? sep : '';
      this.resolvedOutputDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = resolve(parentDir, childDir);
        if (!existsSync(curDir)) {
          mkdirSync(curDir);
        }
        return curDir;
      }, initDir);

      this.changeLogFile = `${this.resolvedOutputDir}/changelog.txt`;
      writeFileSync(this.changeLogFile, '');

      watch(this.resolvedOutputDir, (eventType, filename) => {
        if (filename.includes('timeline-reporter')) {
          appendFileSync(this.changeLogFile, `${filename}\n`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  takeScreenshot() {
    try {
      const filename = Date.now().toString();
      const filePath = resolve(this.resolvedOutputDir, `${filename}.png`);
      browser.saveScreenshot(filePath);
    } catch (e) {
      console.log(e);
    }
  }

  beforeSession(config) {
    this.setReporterOptions(config);
  }

  beforeCommand(commandName) {
    const { screenshotStrategy } = this.reporterOptions;
    if (screenshotStrategy === BEFORE_CLICK && 'click' === commandName) {
      this.takeScreenshot();
    }
  }

  afterTest(test) {
    const { screenshotStrategy } = this.reporterOptions;
    if (screenshotStrategy === BEFORE_CLICK) {
      this.takeScreenshot();
    }
    if (screenshotStrategy === ON_ERROR && !test.passed) {
      this.takeScreenshot();
    }
  }

  async resize(screenshots: string[]) {
    let { resize, quality, reductionRatio } = this.reporterOptions.images;
    if (resize) {
      console.log(
        `TIMELINE:ScreenshotService: Attempting to resize ${
          screenshots.length
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
      const promises = screenshots.map(filePath =>
        waitForFileExistsAndResize(filePath, quality, reductionRatio)
      );
      await Promise.all(promises);
    }
    return Promise.all([]);
  }

  onComplete() {
    const folderAndChangeLogFileExists =
      existsSync(this.resolvedOutputDir) && existsSync(this.changeLogFile);

    if (folderAndChangeLogFileExists) {
      const runnerLogFiles = readFileSync(this.changeLogFile, 'utf-8')
        .split('\n')
        .filter(line => line !== '');

      const results = [];

      Array.from(new Set(runnerLogFiles))
        .filter(line => line !== '')
        .forEach(file => {
          let runnerResult;
          try {
            const reportLog = `${this.resolvedOutputDir}/${file}`;
            runnerResult = JSON.parse(readFileSync(reportLog).toString());
          } catch (error) {
            console.log(error);
          } finally {
            runnerResult && results.push(runnerResult);
          }
        });

      const combinedTestResults = this.generateTestResults(results);
      const screenshots = deepSearch('screenshots', combinedTestResults);
      const flattenedArrayOfScreenshots = [].concat.apply([], screenshots);

      return this.resize(flattenedArrayOfScreenshots).then(() =>
        new Promise(resolve => {
          const body = generateMarkup(combinedTestResults);
          const finalHtml = indexHtml(body);
          resolve(finalHtml);
        })
          .then(finalHtml =>
            writeFilePromiseSync(
              `${this.resolvedOutputDir}/${this.reporterOptions.fileName}`,
              finalHtml
            )
          )
          .then(() => {
            const cyan = '\x1b[35m';
            console.log(
              `${cyan}--------\n${cyan}TIMELINE REPORTER: Created ${
                this.resolvedOutputDir
              }/${this.reporterOptions.fileName}\n${cyan}--------`
            );
          })
          .catch(error => {
            throw error;
          })
      );
    }
  }

  generateTestResults(results) {
    const passed = results.reduce(
      (accumulator, result) => result.state.passed + accumulator,
      0
    );
    const failed = results.reduce(
      (accumulator, result) => result.state.failed + accumulator,
      0
    );
    const skipped = results.reduce(
      (accumulator, result) => result.state.skipped + accumulator,
      0
    );

    const totalDuration = results.reduce(
      (accumulator, result) => result.duration + accumulator,
      0
    );
    const total = passed + failed + skipped;

    let unknown = 0;
    return {
      summary: {
        passed,
        failed,
        skipped,
        total,
        unknown,
        duration: totalDuration
      },
      specs: results.map(result => ({
        start: result.start,
        end: result.end,
        duration: result.duration,
        filename: result.specs[0],
        browser: `${result.capabilities.browserName} ${result.capabilities
          .version || 'unknown'}`,
        suites: result.suites.map(suite => ({
          title: suite.title,
          duration: suite.duration,
          start: suite.start,
          end: suite.end,
          tests: suite.tests.map(test => ({
            browser: `${result.capabilities.browserName} ${result.capabilities
              .version || 'unknown'}`,
            title: test.title,
            start: test.start,
            end: test.end,
            duration: test.duration,
            state: test.state,
            screenshots: test.screenshots || [],
            error: test.error,
            embedImages: this.reporterOptions.embedImages
          }))
        }))
      }))
    };
  }
}
