import chai from 'chai';
import { TimelineService } from '../lib/timeline-service';

const expect = chai.expect;

describe('Create instance', function() {
  it('should throw timeline not set as a reporter', function() {
    const service = new TimelineService();
    const config = {
      reporters: ['one']
    };
    expect(() => service.setReporterOptions(config)).to.throw(
      Error,
      'Add timeline to reporters in wdio config: \n            reporters: [[timeline]]\n        '
    );
  });

  it('should throw Error if reporter options is not set', function() {
    const service = new TimelineService();
    const config = {
      reporters: ['one', ['timeline']]
    };
    expect(() => service.setReporterOptions(config)).to.throw(
      Error,
      'Add reporter options object to timeline reporter: \n            reporters: [[timeline, {}]]\n        '
    );
  });

  it('should throw Error if options.outputdir is not set', function() {
    const service = new TimelineService();
    const config = {
      reporters: ['one', ['timeline', {}]]
    };
    expect(() => service.setReporterOptions(config)).to.throw(
      Error,
      "Set outputDir on reporter options object: \n            reporters: [[timeline, {\n              outputDir: 'desired_folder'\n            }]]\n        "
    );
  });

  it('should set options', function() {
    const service = new TimelineService();
    const config = {
      reporters: ['one', ['timeline', { outputDir: 'someDirectory' }]]
    };
    expect(() => service.setReporterOptions(config)).to.not.throw();
    expect(service.reporterOptions).deep.equals({ outputDir: 'someDirectory' });
    expect(service.resolvedOutputDir).deep.equals(
      `${process.cwd()}/someDirectory`
    );
  });
});
