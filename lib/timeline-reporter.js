const events = require('events');
const fs = require('fs-extra');
const base64Img = require('base64-img');
const path = require('path');
const humanizeDuration = require('humanize-duration');
const Jimp = require('jimp');
const merge = require('deepmerge')

const round = { round: true };
const defaultFilename = 'timeline-report.html';

// templates
const html = require('./templates/index-template');
const resultSummaryTemplate = require('./templates/result-summary-template');

class TimelineReporter extends events.EventEmitter {

    constructor(baseReporter, config, options = {}) {
        super();
        this.baseReporter = baseReporter;
        this.config = config;
        this.options = options;
        this.specs = {};
        this.results = {};

        this.on('runner:start', function (runner) {
            this.specs[runner.cid] = runner.specs
            this.results[runner.cid] = {
                passing: 0,
                pending: 0,
                failing: 0
            };
        });

        this.on('suite:start', function (suite) { });

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
            if (test) {
                let filePath = this.resolveScreenshotPath(runner.filename);
                test.screenshots.push(filePath);

                const { images } = this.getReporterOptions();
                let { quality, resize, reductionRatio } = images;
                quality = (Number.isInteger(quality) && 0 < quality && 100 >= quality) ? Math.round(quality) : 70;
                reductionRatio = (Number.isInteger(reductionRatio) && 0 < reductionRatio && 5 >= reductionRatio) ? Math.round(reductionRatio) : 5;

                if (resize) {
                    return Jimp.read(filePath)
                        .then(file => {
                            file
                                .resize(Math.round(file.getWidth() / reductionRatio), Jimp.AUTO)
                                .quality(quality)
                                .write(filePath);
                        })
                        .catch(err => {
                            console.error(`TIMELINE REPORTER: \n${err}`);
                        });
                }
            }
        });

        this.on('runner:end', function (runner) {
        });

        this.on('timeline:addContext', this.addSomeContext);

        this.on('end', function (runner) {
            const { images } = this.getReporterOptions();
            const { embed } = images;

            let screenshotsHtml = '';
            const runners = Object.keys(this.baseReporter.stats.runners);
            // let total = 0, passed = 0, failed = 0, skipped = 0;
            const passed = runners.reduce((accumulator, cid) => {
                return this.results[cid].passing + accumulator;
            }, 0);
            const failed = runners.reduce((accumulator, cid) => {
                return this.results[cid].failing + accumulator;
            }, 0);
            const skipped = runners.reduce((accumulator, cid) => {
                return this.results[cid].pending + accumulator;
            }, 0);
            const total = passed + failed + skipped;
            // runners
            for (let cid of runners) {
                let runnerInfo = this.baseReporter.stats.runners[cid];
                // specs
                for (let specId of Object.keys(runnerInfo.specs)) {
                    let specHtml = '';
                    let specInfo = runnerInfo.specs[specId];
                    // suites
                    for (let suiteName of Object.keys(specInfo.suites)) {
                        let suiteHtml = '';
                        const suiteInfo = specInfo.suites[suiteName];
                        if (!suiteInfo.uid.includes('before all')
                            && !suiteInfo.uid.includes('after all')
                            && Object.keys(suiteInfo.tests).length > 0) {

                            for (let testId of Object.keys(suiteInfo.tests)) {
                                const { 
                                    state, 
                                    title, 
                                    screenshots, 
                                    error, 
                                    _duration, 
                                    start, 
                                    end, 
                                    context 
                                } = suiteInfo.tests[testId];

                                const imagesHtml = this.generateImagesHtml(screenshots, embed);
                                const errorHtml = this.generateErrorHtml(state, error);
                                const stateTagHtml = this.generateStateTagHtml(state);

                                const isPending = state === 'pending'
                                suiteHtml += `
                                    <div class="test ${state}">
                                        <p class="subtitle is-5">${stateTagHtml}Test Name: ${title}</p>
                                        ${!isPending ? `<div class="columns">
                                            <div class="column is-half">
                                                <table class="table is-striped is-fullwidth is-bordered">
                                                    <tr><td>Browser:</td><td>${this.baseReporter.stats.runners[cid].capabilities.browserName}</td></tr> 
                                                    <tr><td>Duration:</td><td>${humanizeDuration(_duration, round)}</td></tr> 
                                                    <tr><td>Start:</td><td>${start}</td></tr>  
                                                    <tr><td>End:</td><td>${end}</td></tr> 
                                                </table>
                                            </div>
                                        </div>` : ``}    
                                        <div class="tile ${!!imagesHtml ? 'screenshots' : 'no-screenshots'}">
                                            <div class="screenshots-scroll-container">
                                                ${imagesHtml}                                                
                                            </div>
                                        </div>
                                        ${errorHtml}
                                        ${!!context ? `${this.makeContextHtml(context)}` : ''}
                                    </div>
                                `;
                            }
                            specHtml += `
                            <div class="box"><h4 class="subtitle is-4">${suiteInfo.title}</h4>
                                ${suiteHtml}
                            </div>
                            `;
                        }
                    }
                    screenshotsHtml +=
                        `<div class="box"><h4 class="title is-4">Spec: ${specInfo.files[0]} (${humanizeDuration(specInfo._duration, round)})</h4>
                        ${specHtml}
                    </div>
                    `
                }
            }
            const resultSummaryHtml = resultSummaryTemplate(total, 
                                                            passed, 
                                                            failed, 
                                                            skipped, 
                                                            humanizeDuration(this.baseReporter.stats._duration, round));
            const finalHtml = html(resultSummaryHtml, screenshotsHtml);

            const { fileName, outputDir } = this.getReporterOptions();
            if (!fileName.endsWith('html')) {
                console.warn(`TIMELINE REPORTER: Report file name should end with html. Your file name is "${fileName}"`);
                fileName = defaultFilename;
            }
            if (fs.pathExistsSync(outputDir)) {
                fs.outputFileSync(`${outputDir}/${fileName}`, finalHtml);
                return;
            }
            fs.outputFileSync(`./${fileName}`, finalHtml);
        });
    }

    resolveScreenshotPath(filename) {
        let resolvedFilePath;
        if (!fs.pathExistsSync(filename)) {
            const fileWithScreenshotPath = path.resolve(this.config.screenshotPath, filename);
            if (this.config.screenshotPath && fs.pathExistsSync(fileWithScreenshotPath)) {
                resolvedFilePath = fileWithScreenshotPath;
            }
        }
        resolvedFilePath = resolvedFilePath || filename;
        return resolvedFilePath;
    }

    getReporterOptions() {
        const options = {
            outputDir: './',
            fileName: defaultFilename,
            images: {
                quality: 70,
                embed: true,
                resize: false,
                reductionRatio: 2
            }
        }
        return merge(options, this.options.timelineReporter || {});
    }

    generateStateTagHtml(state) {
        const stateCssAndMessage = {
            pending: { css: 'is-warning', message: 'Skipped' },
            pass: { css: 'is-primary', message: 'Passed' },
            fail: { css: 'is-danger', message: 'Failed' },
        }
        return stateCssAndMessage[state] ? `<span class="tag ${stateCssAndMessage[state].css}">${stateCssAndMessage[state].message}</span> ` : '';
    }


    generateErrorHtml(state, error) {
        if (state === 'fail' && error) {
            const { message, type, stack } = error;
            return `
                <details>
                    <summary>ERROR LOG</summary>
                    <table class="table is-striped is-bordered is-fullwidth">
                        ${!!type ? `<tr><td>Type:</td><td>${type}</td></tr>` : ``}  
                        ${!!message ? `<tr><td>Message:</td><td>${message.replace(/<|>/g, '')}</td></tr>` : ``}  
                        ${!!stack ? `<tr><td>Stack:</td><td>${stack.replace(/<|>/g, '')}</td></tr>` : ``}  
                    </table>
                </details>
            `;
        }
        return '';
    }

    generateImagesHtml(screenshots, embed) {
        return screenshots.reduce((accumulator, currentValue) => {
            if (fs.existsSync(currentValue)) {
                const data = embed ? base64Img.base64Sync(currentValue) : currentValue;
                return `${accumulator}<img class="screenshot-img" src="${data}" />`
            }
            console.warn(`TIMELINE REPORTER: Could not attach image: ${currentValue}`);
            return accumulator;
        }, '');
    }

    makeContextHtml(context) {
        const makeRowDom = (item) => {
            if (typeof item === 'string') {
                return `<tr><td></td><td>${item}</td></tr>`
            } else if (typeof item === 'object') {
                return `</tr><td>${item.title}:</td><td>${item.value}</td></tr>`;
            }
            return '';
        }
        const markup = context.map(makeRowDom);
        const expandableDetailsDom = `${!!markup ? `<details><summary>ADDITIONAL CONTEXT</summary><table class="table is-striped is-bordered is-fullwidth">${markup.join('')}</table></details>` : ''}`;
        return expandableDetailsDom;
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
        const test = this.getCurrentTest(cid)
        if (test) {
            test['context'] = test['context'] || [];
            test['context'].push(context);
        }
    }

    static addContext(context) {
        TimelineReporter.tellReporter('timeline:addContext', { context })
    }

    static tellReporter(event, msg = {}) {
        process.send({ event, ...msg })
    }
}

module.exports = TimelineReporter;