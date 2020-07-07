import WDIOReporter from '@wdio/reporter';
import { MapHooks } from './mapHooks';
import { MapTests } from './mapTests';
import { initResultSet, ResultSet } from './initResultSet';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { deepMerge } from './utils';

interface Images {
  quality?: number;
  resize?: boolean;
  reductionRatio?: number;
}

export interface ReporterOptions {
  outputDir?: string;
  fileName?: string;
  embedImages?: boolean;
  images?: Images;
  screenshotStrategy?: string;
  stdout?: boolean;
}

interface TestSuite {
  title: string;
  duration: number;
  start: string;
  end: string;
  tests: any;
  hooks: any;
}

class TimelineReporter extends WDIOReporter {
  [x: string]: any;
  reporterOptions: ReporterOptions;
  suites: any;

  constructor(options?: ReporterOptions) {
    if (!options) {
      throw new Error('Set timeline reporter options object');
    }
    options = { ...options, stdout: false };
    if (!options.outputDir) {
      throw new Error('Set outputDir on reporter options object');
    }
    const mergedOptions = deepMerge(
      // default
      {
        fileName: 'timeline-report.html',
        embedImages: false,
        images: {
          quality: 80,
          resize: false,
          reductionRatio: 2
        },
        screenshotStrategy: 'none'
      },
      options
    );
    super(options);
    this.reporterOptions = mergedOptions;
    this.registerListeners();
  }

  onTestStart(test) {
    this.test = test;
    this.test.screenshots = [];
  }

  onAfterCommand(command) {
    if (
      this.reporterOptions.screenshotStrategy!== 'none' &&
      command.endpoint.includes('screenshot') &&
      command.result &&
      command.result.value &&
      this.test
    ) {
      try {
        const filepath = resolve(
          this.reporterOptions.outputDir,
          `file-${Date.now()}.jpeg`
        );
        var wstream = createWriteStream(filepath);
        wstream.write(Buffer.from(command.result.value, 'base64'));
        wstream.end();
        this.test.screenshots.push(filepath);
      } catch (error) {
        console.log(error);
      }
    }
  }

  onRunnerEnd(runner) {
    let json = this.prepareJson(runner);
    this.write(JSON.stringify(json, null, 2));
  }

  prepareJson(runner) {
    var resultSet: ResultSet = initResultSet(runner);

    for (let specId of Object.keys(runner.specs)) {
      resultSet.specs.push(runner.specs[specId]);
      for (let suiteKey of Object.keys(this.suites)) {
        const suite = this.suites[suiteKey];
        let testSuite: TestSuite = {
          title: suite.title,
          duration: suite._duration,
          start: suite.start,
          end: suite.end,
          tests: MapTests(suite.tests),
          hooks: MapHooks(suite.hooks)
        };

        resultSet.state.failed += testSuite.hooks.filter(
          hook => hook.error
        ).length;
        resultSet.state.passed += testSuite.tests.filter(
          test => test.state === 'passed'
        ).length;
        resultSet.state.failed += testSuite.tests.filter(
          test => test.state === 'failed'
        ).length;
        resultSet.state.skipped += testSuite.tests.filter(
          test => test.state === 'skipped'
        ).length;
        resultSet.suites.push(testSuite);
      }
    }

    return resultSet;
  }

  private registerListeners() {
    // @ts-ignore
    process.on('timeline:addContext', this.addSomeContext.bind(this));
  }

  addSomeContext(object) {
    const { context } = object;
    if (this.test) {
      this.test.context = this.test.context || [];
      this.test.context.push(context);
    }
  }

  static addContext(context) {
    TimelineReporter.tellReporter('timeline:addContext', { context });
  }

  private static tellReporter(event, msg = {}) {
    // @ts-ignore
    process.emit(event, msg);
  }
}

export default TimelineReporter;
