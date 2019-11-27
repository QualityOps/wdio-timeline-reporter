import {
  existsSync,
  mkdirSync,
  writeFileSync,
  watch,
  appendFileSync,
  readFileSync,
  writeFile,
  FSWatcher
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

type WdioReporter = string | Array<any>;
interface WdioConfiguration {
  reporters: WdioReporter[];
}

export class TimelineService {
  public reporterOptions: ReporterOptions;
  public resolvedOutputDir: string;
  public changeLogFile: string;
  public startTime: number;
  public stopTime: number;
  public watcher: FSWatcher;

  setReporterOptions(config: WdioConfiguration) {
    const timelineFilter = config.reporters.filter(
      item => Array.isArray(item) && item[0] === 'timeline'
    );
    if (timelineFilter.length === 0) {
      throw new Error(
        `Add timeline to reporters in wdio config: 
            reporters: [[timeline]]
        `
      );
    }
    const timeline = timelineFilter[0];
    if (timeline.length !== 2 || typeof timeline[1] !== 'object') {
      throw new Error(
        `Add reporter options object to timeline reporter: 
            reporters: [[timeline, {}]]
        `
      );
    }
    if (!timeline[1].outputDir) {
      throw new Error(
        `Set outputDir on reporter options object: 
            reporters: [[timeline, {
              outputDir: 'desired_folder'
            }]]
        `
      );
    }
    this.reporterOptions = timeline[1];
    this.resolvedOutputDir = resolve(this.reporterOptions.outputDir);
  }

  onPrepare(config) {
    this.startTime = Date.now();
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

      // close watcher in onComplete
      this.watcher = watch(this.resolvedOutputDir, (eventType, filename) => {
        if (filename.includes('timeline-reporter')) {
          appendFileSync(this.changeLogFile, `${filename}\n`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  beforeSession(config) {
    this.setReporterOptions(config);
  }

  beforeCommand(commandName) {
    const { screenshotStrategy } = this.reporterOptions;
    if (screenshotStrategy === BEFORE_CLICK && 'click' === commandName) {
      browser.takeScreenshot();
    }
  }

  afterTest(test) {
    const { screenshotStrategy } = this.reporterOptions;
    if (screenshotStrategy === BEFORE_CLICK) {
      browser.takeScreenshot();
    }
    if (screenshotStrategy === ON_ERROR && !test.passed) {
      browser.takeScreenshot();
    }
  }

  async resize(screenshots: string[]) {
    if (this.reporterOptions.images && this.reporterOptions.images.resize) {
      let { quality, reductionRatio } = this.reporterOptions.images;
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
      return Promise.all(promises);
    }
    return Promise.all([]);
  }

  getFileName() {
    return `${this.resolvedOutputDir}/${this.reporterOptions.fileName ||
      'timeline-report.html'}`;
  }

  onComplete() {
    const folderAndChangeLogFileExists =
      existsSync(this.resolvedOutputDir) && existsSync(this.changeLogFile);

    // close watcher
    this.watcher.close();

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
            const reportLogPath = `${this.resolvedOutputDir}/${file}`;
            const reportLog = readFileSync(reportLogPath).toString();
            if (reportLog) {
              runnerResult = JSON.parse(reportLog);
            }
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
            writeFilePromiseSync(this.getFileName(), finalHtml)
          )
          .then(() => {
            const cyan = '\x1b[35m';
            console.log(
              `${cyan}--------\n${cyan}TIMELINE REPORTER: Created ${this.getFileName()}\n${cyan}--------`
            );
          })
          .catch(error => {
            throw error;
          })
      );
    }
  }

  getBrowserNameAndCombo(capabilities) {
    const name =
      capabilities.browserName ||
      capabilities.deviceName ||
      'unknown browser name';
    const version =
      capabilities.browserVersion ||
      capabilities.platformVersion ||
      capabilities.version ||
      'unknown browser version';
    return `${name} ${version}`;
  }

  generateTestResults(results) {
    this.stopTime = Date.now();
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

    const totalDuration = this.stopTime - this.startTime;
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
        browser: this.getBrowserNameAndCombo(result.capabilities),
        suites: result.suites.map(suite => ({
          title: suite.title,
          duration: suite.duration,
          start: suite.start,
          end: suite.end,
          tests: suite.tests.map(test => ({
            browser: this.getBrowserNameAndCombo(result.capabilities),
            title: test.title,
            start: test.start,
            end: test.end,
            duration: test.duration,
            state: test.state,
            screenshots: test.screenshots || [],
            error: test.error,
            context: test.context,
            embedImages: this.reporterOptions.embedImages
          }))
        }))
      }))
    };
  }
}
