const resultSummaryTemplate = (total, passed, failed, skipped, duration) => {
    return `
    <section class="section has-background-light">
        <div class="container">
            <div class="columns has-text-centered">
                <div class="column">
                    <div class="notification is-link">
                        <h1 class=" title is-size-10">Total</h1>
                        <h1 class=" title is-size-8">${total}</h1>
                    </div>
                </div>
                <div class="column">
                    <div class="notification is-primary">
                        <h1 class=" title is-size-10">Passed</h1>
                        <h1 class=" title is-size-8">${passed}</h1>
                    </div>
                </div>
                <div class="column">
                    <div class="notification is-danger">
                        <h1 class=" title is-size-10">Failed</h1>
                        <h1 class=" title is-size-8">${failed}</h1>
                    </div>
                </div>
                <div class="column">
                    <div class="notification is-warning">
                        <h1 class=" title is-size-10">Skipped</h1>
                        <h1 class=" title is-size-8">${skipped}</h1>
                    </div>
                </div>
            </div>
            <h3 class="title is-4">Total Duration: ${duration}</h3> 
        </div>
    </section>
    `;
}

module.exports = resultSummaryTemplate;