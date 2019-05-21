const cssStyle = `
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

    details {
        color: #FF3860;
        border-radius: 4px;
        padding: .5em .5em 0;
    }

    summary {
        font-weight: bold;
        font-size: 1rem;
    }

    table {
        text-overflow: elipsis;
    }

    #filter {
        padding-top: 14px;
    }

    #results.passed .test.failed {
        display: none;
    }
    
    #results.passed .test.skipped {
        display: none;
    }
    
    #results.passed .test.pending {
        display: none;
    }
    
    #results.skipped .test.passed {
        display: none;
    }
    
    #results.skipped .test.failed {
        display: none;
    }

    #results.skipped .test.pending {
        display: none;
    }
    
    #results.failed .test.skipped {
        display: none;
    }
    
    #results.failed .test.passed {
        display: none;
    }

    #results.failed .test.pending {
        display: none;
    }

    .hide {
        display: none;
    }
    
    .linkable-header__link {
        opacity: 0;
        margin-left: -30px;
        width: 30px;
        display: inline-block;
    }
    
    .linkable-header:hover .linkable-header__link,
    .linkable-header .linkable-header__link:focus {
        opacity: 1;
    }
`;

const javascript = `
    const imgs = document.querySelectorAll('.screenshot-img');
    const modalEl = document.querySelector('.modal');
    const modalImgEl = document.querySelector('#show-me');
    const allTests = document.querySelectorAll('.test');
    const passedTests = document.querySelectorAll('.test.passed');
    const failedTests = document.querySelectorAll('.test.failed');
    const skippedTests = document.querySelectorAll('.test.skipped');
    const filterButtons = document.querySelectorAll("#filter span");

    // Register onClick listeners on thumbnails
    for (let i = 0; i < imgs.length; i++) {
        imgs[i].addEventListener('click', function updateModal(event) {
            modalImgEl.setAttribute('src', event.target.src);
            if (modalImgEl.naturalWidth / modalImgEl.naturalHeight > 1) {
                document.querySelector('.modal-content').setAttribute("style", "width: 90%;");
            } else {
                document.querySelector('.modal-content').setAttribute("style", "width: 640px");
            }

            modalEl.classList.add('is-active');
        });
    }

    const removeHide = function() {
        const elements = document.querySelectorAll('.hide');
        Array.from(elements).forEach(element => element.classList.remove('hide'));
    }

    const hideSuites = function() {
        const suites = document.querySelectorAll("div[data-box-is='suite']");
        for (let i = 0; i < suites.length; i++) {
            const shouldHide = !Array.from(suites[i].querySelectorAll('div.test'))
                                    .some(element => element.offsetHeight > 0)
            if (shouldHide) {
                suites[i].classList.add("hide");  
            }
        }
    }

    const hideSpecs = function() {
        const specs = document.querySelectorAll("div[data-box-is='spec']");
        for (let i = 0; i < specs.length; i++) {
            const shouldHide = !Array.from(
                specs[i].querySelectorAll('div[data-box-is="suite"]')
                ).some(element => element.offsetHeight > 0);
            if (shouldHide) {
                specs[i].classList.add("hide");
            }
        }
    }

    for (let i = 0, max = filterButtons.length; i < max; i++) {
        filterButtons[i].onclick = function (event) {
            const container = document.querySelector('#results');
            const statusClasses = ['all', 'passed', 'failed', 'skipped'];
            statusClasses.forEach(item => container.classList.remove(item));
            const status = event.target.dataset.status;
            container.classList.add(status);
            
            const isSelected = document.querySelector('#filter .is-selected');
            isSelected.classList.remove('is-selected');
            const notificationClasses = ['is-primary', 'is-warning', 'is-danger', 'is-link'];
            notificationClasses.forEach(item => isSelected.classList.remove(item));
            switch (status) {
                case 'passed':
                    event.target.classList.add('is-primary');
                    break;   
                case 'skipped':
                    event.target.classList.add('is-warning');
                    break;
                case 'failed':
                    event.target.classList.add('is-danger');
                    break ;
                default:
                    event.target.classList.add('is-link');
                    break;
            }
            event.target.classList.add('is-selected');
            removeHide();
            hideSuites();
            hideSpecs();
        }
    };

    // Register onClick listener on the modal
    modalEl.addEventListener('click', function hideModal(event) {
        const isActive = modalEl.classList.contains('is-active');
        if (isActive) {
            modalEl.classList.remove('is-active');
        }
    });
`;

const indexHtml = body => `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Timeline Report</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.css">
            <style>
                ${cssStyle}
            </style>
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
        </head>

        <body>
            ${body}
            <script type="text/javascript">
                ${javascript}
            </script>
        </body>
    </html>
    `;

export default indexHtml;
