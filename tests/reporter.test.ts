import chai from 'chai';
import TimelineReporter from '../lib/timeline-reporter';

const expect = chai.expect;

describe('Create instance', function() {
  it('should throw Error if options is undefined', function() {
    expect(() => new TimelineReporter(undefined)).to.throw(
      Error,
      'Set timeline reporter options object'
    );
  });

  it('should throw Error if options.outputdir is undefined', function() {
    expect(() => new TimelineReporter({})).to.throw(
      Error,
      'Set outputDir on reporter options object'
    );
    expect(() => new TimelineReporter({ outputDir: undefined })).to.throw(
      Error,
      'Set outputDir on reporter options object'
    );
  });

  it('should throw Error if options.outputdir is null', function() {
    expect(() => new TimelineReporter({ outputDir: null })).to.throw(
      Error,
      'Set outputDir on reporter options object'
    );
  });
});

// describe('on:end event should create html file', function () {
//     before(function () {
//         timelineReporter = new TimelineReporter(baseReporter, config, options);
//         filename = `${Date.now().toString()}.html`;
//         options.timelineReporter.fileName = filename;
//         const runner = baseReporter.stats.runners['0-0'];
//         timelineReporter.emit('runner:start', runner);
//         timelineReporter.results = {
//             '0-0': {
//                 passing: 1,
//                 pending: 0,
//                 failing: 0
//             },
//             '0-3': {
//                 passing: 1,
//                 pending: 0,
//                 failing: 0
//             },
//             '0-4': {
//                 passing: 0,
//                 pending: 0,
//                 failing: 1
//             },
//             '0-2': {
//                 passing: 1,
//                 pending: 0,
//                 failing: 0
//             },
//             '0-1': {
//                 passing: 2,
//                 pending: 1,
//                 failing: 0
//             }
//         };
//         timelineReporter.emit('end', runner);
//         testResults = timelineReporter.generateTestResults();
//     });

//     it('should have a field summary containing test summary', function () {
//         const { summary } = testResults;
//         expect(summary).to.deep.equal({
//             passed: 5,
//             failed: 1,
//             skipped: 1,
//             total: 7,
//             duration: '1 minute, 28 seconds'
//         });
//     });

//     it('should have a field specs containing suites', function () {
//         const { specs } = testResults;
//         expect(specs.length).to.equal(5);
//     });

//     it('creates report with specified filename', function () {
//         expect(fs.existsSync(`./bin/${filename}`)).to.be.true;
//     });
// });
