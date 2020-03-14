const { Scheduler } = require('./scheduler')
const { Transform } = require('./transform')

class Scraper extends Transform {
    constructor() {
        super()

        this.scheduler = new Scheduler( /* TODO: use correct options */ )
    }

    serializeScrapeFunction(func, args = {}) {
        func = func.toString()
        func = func.slice(func.indexOf('{') + 1, func.lastIndexOf('}'))

        Object.entries(args).forEach(([name, value]) => {
            func = `const ${name} = ${JSON.stringify(value)};\n` + func
        })

        return func
    }

    async scrapeWithPuppeteerFunction(func, args) {
        this.warn(`Using backend-dot-try-puppeteer.appspot.com backend which might not be stable.`)

        if (typeof(func) === 'function') {
            func = this.serializeScrapeFunction(func, args)
        }

        const boundary = `----WebKitFormBoundary` + Math.random().toString(32).slice(2)

        const body = `--${boundary}\r
Content-Disposition: form-data; name="file"; filename="blob"\r
Content-Type: text/javascript\r
\r
${func}\r
--${boundary}--`

        const headers = {
            'content-type': `multipart/form-data; boundary=${boundary}`,
            'content-length': body.length
        }

        const { responseBody } = await this.scheduler.tryRequest({ method: 'POST', uri: 'https://backend-dot-try-puppeteer.appspot.com/run', headers, body })

        return JSON.parse(responseBody)
    }
}

module.exports = { Scraper }
