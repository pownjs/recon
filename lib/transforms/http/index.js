const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { URI_TYPE, STRING_TYPE, CODE_TYPE, TITLE_TYPE, SOFTWARE_TYPE } = require('../../types')

const DEFAULT_TIMEOUT = 30000
const DEFAULT_CONCURRENCY = 300

const scheduler = new Scheduler()

const httpFingerprint = class extends Transform {
    static get alias() {
        return ['http_fingerprint', 'hf']
    }

    static get title() {
        return 'HTTP Fingerprint'
    }

    static get description() {
        return 'Performs a fingerprint on the HTTP server and application.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'local', 'http']
    }

    static get types() {
        return [URI_TYPE]
    }

    static get options() {
        return {
            timeout: {
                description: 'HTTP timeout interval',
                type: 'number',
                default: DEFAULT_TIMEOUT
            },

            concurrency: {
                description: 'Number of concurrent scans',
                type: 'number',
                default: DEFAULT_CONCURRENCY
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, { timeout = DEFAULT_TIMEOUT }) {
        const results = []

        const { responseCode, responseHeaders, responseBody } = await scheduler.request({ uri: label, timeout, rejectUnauthorized: false })

        let server = responseHeaders['server']
        let contentType = responseHeaders['content-type']

        if (responseCode) {
            results.push({ type: CODE_TYPE, label: `${responseCode}/HTTP`, props: { code: responseCode }, edges: [source] })
        }

        if (server) {
            server = server.trim()

            results.push({ type: SOFTWARE_TYPE, label: `${server}`, props: { server }, edges: [source] })
        }

        if (contentType) {
            contentType = contentType.trim().toLowerCase()

            results.push({ type: STRING_TYPE, label: `${contentType}`, props: { contentType }, edges: [source] })
        }

        const text = responseBody.toString().trim()

        if (text) {
            const titleMatch = text.match(/<title>([^<]+)/i)

            if (titleMatch) {
                console.log(titleMatch[1])
                const title = titleMatch[1]

                results.push({ type: TITLE_TYPE, label: `${title}`, props: { title }, edges: [source] })
            }

            const generatorMatch = text.match(/<meta\s+name="generator"\s+content="(.+?)"|<meta\s+content="(.+?)"\s+name="generator"/i)

            if (generatorMatch) {
                const software = generatorMatch[1].toLowerCase()

                results.push({ type: SOFTWARE_TYPE, label: `${software}`, props: { software }, edges: [source] })
            }
        }

        return results
    }

    async run(items, { timeout = DEFAULT_TIMEOUT, concurrency = DEFAULT_CONCURRENCY }) {
        return await super.run(items, { timeout }, concurrency)
    }
}

module.exports = { httpFingerprint }
