const fse = require('fs-extra');
const assert = require('assert');
const TimelineReporter = require('../lib/timeline-reporter');
const baseReporter = require('./data/baseReporter.json');
const config = require('./data/config.json');
const options = require('./data/options.json');

const runner = baseReporter.stats.runners['0-0'];

describe('on:end event should create html file', function () {
    it.only('creates report with specified filename', function () {
        const timelineReporter = new TimelineReporter(baseReporter, config, options);
        const filename = `${Date.now().toString()}.html`;
        options.timelineReporter.fileName = filename
        timelineReporter.emit('runner:start', runner);
        timelineReporter.emit('end', runner);
        assert.equal(fse.existsSync(`./bin/${filename}`), true);
    });
});