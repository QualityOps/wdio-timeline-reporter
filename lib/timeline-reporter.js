const events = require('events');
const fs = require('fs-extra');
const base64Img = require('base64-img');


const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Test Screenshots</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #333;
        }

        .test {
            width: 90%;
            margin: 3rem auto;
        }

        .screenshots-scroll-container {
            overflow-x: scroll;
        }

        .screenshots {
            padding: 10px 5px 10px 10px;
            white-space: nowrap;
            background: #bbb;
        }

        .screenshots img {
            width: 300px;
            margin-right: 5px;
        }

        .fail p {
            color: #FF3860;   
        }
    </style>
</head>

<body>
    <div class="modal">
        <div class="modal-background"></div>
        <div class="modal-content">
            <p class="image">
                <img id="show-me" src="#" alt="">
            </p>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
    </div>
    {{result-summary}}
    <section class="has-background-grey-lighter">
        <div class="container">
            <div class="columns">
                <div class="column is-half">
                    <div class="field">
                        <div id="filter" class="control">
                            <label class="radio">
                                <input type="radio" checked name="question" value="all"> All
                            </label>
                            <label class="radio">
                                <input type="radio" name="question" value="passed"> Passed
                            </label>
                            <label class="radio">
                                <input type="radio" name="question" value="failed"> Failed
                            </label>
                            <label class="radio">
                                <input type="radio" name="question" value="pending"> Skipped
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tests">
                {{content}}
            </div>
        </div>
    </section>
    <script type="text/javascript">
        var imgs = document.querySelectorAll('.screenshot-img');
        var modalEl = document.querySelector('.modal');
        var modalImgEl = document.querySelector('#show-me');
        var allTests = document.querySelectorAll('.test');
        var passedTests = document.querySelectorAll('.test.pass');
        var failedTests = document.querySelectorAll('.test.fail');
        var skippedTests = document.querySelectorAll('.test.pending');
        var filterRadios = document.querySelectorAll("#filter input");

        // Register onClick listeners on thumbnails
        for (let i = 0; i < imgs.length; i++) {
            imgs[i].addEventListener('click', function updateModal(event) {
                modalImgEl.setAttribute('src', event.target.src);
                modalEl.classList.add('is-active');
            });
        }

        // Show an element
        const show = function (elem) {
            elem.style.display = 'block';
        };

        // Hide an element
        const hide = function (elem) {
            elem.style.display = 'none';
        };

        const showAll = function() {
            for (let i = 0; i < allTests.length; i++) {
                show(allTests[i]);        
            }
        };

        const hideAll = function() {
            for (let i = 0; i < allTests.length; i++) {
                hide(allTests[i]);        
            }
        };

        const showFailed = function() {
            for (let i = 0; i < failedTests.length; i++) {
                show(failedTests[i]);        
            } 
        };

        const showPassed = function() {
            for (let i = 0; i < passedTests.length; i++) {
                show(passedTests[i]);        
            }
        };

        const showPending = function() {
            for (let i = 0; i < skippedTests.length; i++) {
                show(skippedTests[i]);        
            }
        };
        
        for(var i = 0, max = filterRadios.length; i < max; i++) {
            filterRadios[i].onclick = function(event) {
                if(event.target.value === 'all') {
                    showAll();
                } else if(event.target.value === 'failed') {
                    hideAll();
                    showFailed();
                } else if (event.target.value === 'passed') {
                    hideAll();
                    showPassed();
                } else if (event.target.value === 'pending') {
                    hideAll();
                    showPending();
                }  
            }
        };

        // Register onClick listener on the modal
        modalEl.addEventListener('click', function hideModal(event) {
            var isActive = modalEl.classList.contains('is-active');
            if (isActive) {
                modalEl.classList.remove('is-active');
            }
        });
    </script>
</body>

</html>
`

const resultSummaryTemplate = `
<section class="section has-background-light">
    <div class="container">
        <div class="columns has-text-centered">
            <div class="column">
                <div class="notification is-link">
                    <h1 class=" title is-size-10">Total</h1>
                    <h1 class=" title is-size-8">{{total}}</h1>
                </div>
            </div>
            <div class="column">
                <div class="notification is-primary">
                    <h1 class=" title is-size-10">Passed</h1>
                    <h1 class=" title is-size-8">{{passed}}</h1>
                </div>
            </div>
            <div class="column">
                <div class="notification is-danger">
                    <h1 class=" title is-size-10">Failed</h1>
                    <h1 class=" title is-size-8">{{failed}}</h1>
                </div>
            </div>
            <div class="column">
                <div class="notification is-warning">
                    <h1 class=" title is-size-10">Skipped</h1>
                    <h1 class=" title is-size-8">{{skipped}}</h1>
                </div>
            </div>
        </div>
    </div>
</section>
`
const errorHtml = `
<div class="notification is-danger">
    {{error}}
</div>
`;

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
            const cid = runner.cid;
            const stats = this.baseReporter.stats;
            const results = stats.runners[cid];
            const specHash = stats.getSpecHash(runner);
            const spec = results.specs[specHash];
            const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length - 1];
            const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length - 1];
            spec.suites[lastKey].tests[currentTestKey].screenshots.push(runner.filename);
        });

        this.on('runner:end', function (runner) {
        });

        this.on('end', function (runner) {
            const embedImage = (this.config.reporterOptions
                && this.config.reporterOptions.timelineReporter
                && this.config.reporterOptions.timelineReporter.embedImage === true)

            let screenshotsCode = '';
            const runners = Object.keys(this.baseReporter.stats.runners);
            let total = 0, passed = 0, failed = 0, skipped = 0;
            // runners
            for (let cid of runners) {
                passed += this.results[cid].passing;
                failed += this.results[cid].failing;
                skipped += this.results[cid].pending;
                total = passed  + failed + skipped;
                let runnerInfo = this.baseReporter.stats.runners[cid];
                // specs
                for (let specId of Object.keys(runnerInfo.specs)) {
                    let specInfo = runnerInfo.specs[specId];
                    screenshotsCode += `<div class="box"><h4 class="title is-4">Spec: ${specInfo.files[0]}</h4>`;
                    // suites
                    for (let suiteName of Object.keys(specInfo.suites)) {
                        const suiteInfo = specInfo.suites[suiteName];
                        if (!suiteInfo.uid.includes('before all')
                            && !suiteInfo.uid.includes('after all')
                            && Object.keys(suiteInfo.tests).length > 0) {
                            screenshotsCode += `<div class="box"><h4 class="subtitle is-4">${suiteInfo.title}</h4>`;    
                            for (let testId of Object.keys(suiteInfo.tests)) {
                                const { state, title, screenshots, error } = suiteInfo.tests[testId];
                                const isPending = state === 'pending';
                                const div1Opening = `<div class="test ${state}">`;
                                const divClosing = '</div>';
                                const testNameTag = `<p class="subtitle is-5">${title}</p>`
                                const pendingPostFix = isPending ? '-pending' : '';
                                const div2Opening = `<div class="screenshots${pendingPostFix}">`;
                                const skippedHtml = isPending ? '<div class="notification is-warning">Skipped</div>' : '';
                                const div3Opening = `<div class="screenshots-scroll-container${pendingPostFix}">${skippedHtml}`;

                                const imagesHtml = screenshots.reduce((accumulator, currentValue) => {
                                    // errror screenshots dont come with path
                                    if (fs.existsSync(currentValue)) {
                                        const data = embedImage ? base64Img.base64Sync(currentValue) : currentValue;
                                        return `${accumulator}<img class="screenshot-img" src="${data}" />`
                                    } else if (!!this.config.screenshotPath) {
                                        const imagePath = path.join(process.cwd(), this.config.screenshotPath, currentValue);
                                        if (fs.existsSync(imagePath)) {
                                            const data = embedImage ? base64Img.base64Sync(imagePath) : imagePath;
                                            return `${accumulator}<img class="screenshot-img" src="${data}" />`
                                        }
                                    }
                                    console.warn(`TIMELINE REPORTER: Could not attach image: ${currentValue}`);
                                    return accumulator;
                                }, '');

                                let errorHtmlCreated = '';
                                if (state === 'fail' && error) {
                                    errorHtmlCreated += '<table class="table is-striped">';
                                    const { message, type, stack } = error;
                                    if (type) {
                                        errorHtmlCreated += `<tr><td>Type:</td><td>${type}</td></tr>`;
                                    }
                                    if (message) {
                                        errorHtmlCreated += `<tr><td>Message:</td><td>${message}</td></tr>`;
                                    }
                                    if (stack) {
                                        errorHtmlCreated += `<tr><td>Stack:</td><td>${stack}</td></tr>`;
                                    }
                                    errorHtmlCreated += '</table>';
                                }
                                !!errorHtmlCreated && (errorHtmlCreated = errorHtml.replace('{{error}}', errorHtmlCreated));
                                
                                screenshotsCode += div1Opening + testNameTag + div2Opening + div3Opening + imagesHtml + divClosing.repeat(2) + errorHtmlCreated + divClosing;
                            }
                            screenshotsCode += '</div>';
                        }
                    }
                    screenshotsCode += '</div>';
                }
            }
            const resultSummaryHtml = resultSummaryTemplate
                                            .replace('{{total}}', total)
                                            .replace('{{passed}}', passed)
                                            .replace('{{failed}}', failed)
                                            .replace('{{skipped}}', skipped);
                                            
            const finalHtml = html.replace('{{result-summary}}', resultSummaryHtml).replace('{{content}}', screenshotsCode);

            const fileName = 'timeline-report.html';

            if (this.config.reporterOptions
                && this.config.reporterOptions.timelineReporter
                && this.config.reporterOptions.timelineReporter.outputDir) {

                if (fs.pathExistsSync(this.config.reporterOptions.timelineReporter.outputDir)) {
                    fs.outputFileSync(`${this.config.reporterOptions.timelineReporter.outputDir}/${fileName}`, finalHtml);
                    return;
                }
            }
            fs.outputFileSync(`./${fileName}`, finalHtml);
        });
    }
}

module.exports = TimelineReporter;