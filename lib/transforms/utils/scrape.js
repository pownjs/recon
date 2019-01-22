const { request } = require('@pown/request')

const serializeScrapeFunction = (func) => {
    func = func.toString()
    func = func.slice(func.indexOf('{') + 1, func.lastIndexOf('}'))

    return func
}

const scrapeWithPuppeteer = async(code) => {
    if (typeof(code) === 'function') {
        code = serializeScrapeFunction(code)
    }

    const boundary = `----WebKitFormBoundary` + Math.random().toString(32).slice(2)

    const body = `--${boundary}\r
Content-Disposition: form-data; name="file"; filename="blob"\r
Content-Type: text/javascript\r
\r
${code}\r
--${boundary}--`

    const headers = {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': body.length
    }

    const { responseBody } = await request({ method: 'POST', uri: 'https://backend-dot-try-puppeteer.appspot.com/run', headers, body })

    const data = responseBody.toString()

    const { errors = '', log = '', result = {} } = JSON.parse(data)

    if (errors) {
        throw new Error(errors)
    }

    const { buffer: resultBuffer = {} } = result
    const { data: resultBufferData = Buffer.alloc(0) } = resultBuffer

    const screenshot = Buffer.from(resultBufferData)

    return { log, screenshot }
}

module.exports = { serializeScrapeFunction, scrapeWithPuppeteer }
