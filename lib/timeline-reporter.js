import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import humanizeDuration from 'humanize-duration';
import merge from 'deepmerge';
import indexHtml from './index-template';

import { generateMarkup } from './components/generate-markup';

const round = { round: true };
const defaultFilename = 'timeline-report.html';

class TimelineReporter extends EventEmitter {
  constructor(baseReporter, config, options = {}) {
    super();
    this.baseReporter = baseReporter;
    this.config = config;
    this.options = options;
    this.specs = {};
    this.results = {};

    this.on('runner:start', function (runner) {
      this.specs[runner.cid] = runner.specs;
      this.results[runner.cid] = {
        passing: 0,
        pending: 0,
        failing: 0,
      };
    });

    this.on('suite:start', () => { });

    this.on('test:pending', function (test) {
      this.results[test.cid].pending++;
    });

    this.on('test:pass', function (test) {
      this.results[test.cid].passing++;
    });

    this.on('test:fail', function (test) {
      this.results[test.cid].failing++;
    });

    this.on('runner:screenshot', function (runner) {
      const test = this.getCurrentTest(runner.cid);
      const filePath = this.resolveScreenshotPath(runner.filename);
      test.screenshots.push(filePath);
    });

    this.on('runner:end', () => {
    });

    this.on('timeline:addContext', this.addSomeContext);

    this.on('end', function () {
      try {
        const testResults = this.generateTestResults();
        const body = generateMarkup(testResults);
        const finalHtml = indexHtml(body);
        let { fileName, outputDir } = this.getReporterOptions();

        if (!fileName.endsWith('html')) {
          console.warn(`TIMELINE REPORTER: Report file name should end with html. Your file name is "${fileName}"`);
          fileName = defaultFilename;
        }
        let absolutePath;
        if (fs.pathExistsSync(outputDir)) {
          absolutePath = path.resolve(outputDir, fileName);
        } else {
          absolutePath = path.resolve('./', fileName);
        }
        fs.outputFileSync(absolutePath, finalHtml);
        const cyan = '\x1b[35m'
        console.log(`${cyan}--------\n${cyan}TIMELINE REPORTER: Created ${absolutePath}\n${cyan}--------`)
      } catch (e) {
        console.warn(`TIMELINE REPORTER: Could not create timeline report. See error below\n\n${e}`)
      }
    });
  }

  generateTestResults() {  
    const { embedImages } = this.getReporterOptions();
    const runners = Object.keys(this.baseReporter.stats.runners);
    const passed = runners.reduce((accumulator, cid) => this.results[cid].passing + accumulator, 0);
    const failed = runners.reduce((accumulator, cid) => this.results[cid].failing + accumulator, 0);
    const skipped = runners.reduce((accumulator, cid) => this.results[cid].pending + accumulator, 0);
    const total = passed + failed + skipped;

    let unknown = 0;

    const testResults = {
      summary: {
        passed,
        failed,
        skipped,
        total,
        duration: humanizeDuration(this.baseReporter.stats._duration, round),
      },
      specs: [],
    };
    // runners
    for (const cid of runners) {
      const runnerInfo = this.baseReporter.stats.runners[cid];
      // specs
      for (const specId of Object.keys(runnerInfo.specs)) {
        const specInfo = runnerInfo.specs[specId];

        const specs = {
          filename: specInfo.files[0],
          duration: humanizeDuration(specInfo._duration, round),
          suites: [],
        };
        // suites
        for (const suiteName of Object.keys(specInfo.suites)) {
          const suiteInfo = specInfo.suites[suiteName];
          const suite = {
            title: suiteInfo.title,
            tests: [],
          };

          if (!suiteInfo.uid.includes('before all')
                        && !suiteInfo.uid.includes('after all')
                        && Object.keys(suiteInfo.tests).length > 0) {
            for (const testId of Object.keys(suiteInfo.tests)) {
              const {
                state,
                title,
                screenshots,
                error,
                _duration,
                start,
                end,
                context,
              } = suiteInfo.tests[testId];
              
              const testResult = {
                title,
                screenshots,
                error,
                context,
                embedImages,
                browser: runnerInfo.sanitizedCapabilities,
                duration: humanizeDuration(_duration, round),
                state: state || 'unknown',
                start: start ? start.toString() : '',
                end: end ? end.toString() : '',
              }
              if (testResult.state === 'unknown') {
                unknown++;
              }
              suite.tests.push(testResult);
            }
            specs.suites.push(suite);
          }
        }
        testResults.specs.push(specs);
      }
    }
    if (!!unknown) {
      testResults.summary.unknown = unknown
      testResults.summary.total = testResults.summary.total + unknown;
    }
    return testResults;
  }

  resolveScreenshotPath(filename) {
    // if screenshotPath is set in wdio.conf.js
    // and path is not provided to savescreenshot function 
    // or screenshot received on error, screenshot filename is 
    // returned without full path e.g 'file.jpeg'
    let { dir } = path.parse(filename);
    if (!!dir && fs.pathExistsSync(dir)) {
      return filename;
    }
    // try with config.screenshotPath
    const fileNamePrependedWithScreenshotPath = path.resolve(this.config.screenshotPath, filename);
    dir =  path.parse(fileNamePrependedWithScreenshotPath).dir;
    if (!!dir && fs.existsSync(dir)) {
      return fileNamePrependedWithScreenshotPath;
    }
    return filename;
  }

  getReporterOptions() {
    const defaultOptions = {
      outputDir: './',
      fileName: defaultFilename,
      embedImages: true
    };
    return merge(defaultOptions, this.options.timelineReporter || {});
  }

  getCurrentTest(cid) {
    let test;
    try {
      const stats = this.baseReporter.stats;
      const results = stats.runners[cid];
      const specsKeys = Object.keys(results.specs);
      const spec = results.specs[specsKeys[0]];
      const suiteKeys = Object.keys(spec.suites);
      const suite = spec.suites[suiteKeys[suiteKeys.length - 1]];
      const testKeys = Object.keys(suite.tests);
      test = suite.tests[testKeys[testKeys.length - 1]];
    } catch (e) {
      // do nothing
    }
    return test;
  }

  addSomeContext(object) {
    const { cid, context } = object;
    const test = this.getCurrentTest(cid);
    if (test) {
      test.context = test.context || [];
      test.context.push(context);
    }
  }

  static addContext(context) {
    TimelineReporter.tellReporter('timeline:addContext', { context });
  }

  static tellReporter(event, msg = {}) {
    process.send({ event, ...msg });
  }
}

module.exports = TimelineReporter;
