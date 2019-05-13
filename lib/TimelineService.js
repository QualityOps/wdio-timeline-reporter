const fs = require('fs');
const humanizeDuration = require('humanize-duration');

class TimelineService {
  onComplete(exitCode, config) {
    const timeline = config.reporters.filter(
      item => Array.isArray(item) && item[0] === 'timeline'
    );

    const outputDir = timeline[0][1].outputDir;

    const results = [];
    const folderExists = fs.existsSync(outputDir);
    if (folderExists) {
      fs.readdirSync(outputDir)
        .filter(file => file.includes('timeline-reporter.log'))
        .forEach(file =>
          results.push(JSON.parse(fs.readFileSync(`${outputDir}/${file}`)))
        );

      fs.writeFileSync(
        `${outputDir}/trinity.json`,
        JSON.stringify(this.generateTestResults(results), null, 2)
        // JSON.stringify(results, null, 2)
      );
      this.generateTestResults(results);
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
    const summary = {
      summary: {
        passed,
        failed,
        skipped,
        total,
        unknown,
        duration: humanizeDuration(totalDuration)
      }
    };
    return summary;
  }
}

module.exports = TimelineService;
