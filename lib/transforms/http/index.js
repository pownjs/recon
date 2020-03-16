const crypto = require('crypto')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { URI_TYPE, STRING_TYPE, CODE_TYPE, TITLE_TYPE, SOFTWARE_TYPE, SHA1_TYPE, FINGERPRINT_TYPE } = require('../../types')

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

        // TODO: build a module to automatically pick these version

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:73.0) Gecko/20100101 Firefox/73.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en;q=0.5',
            'Accept-Encoding': 'deflate, gzip'
        }

        const { responseCode, responseHeaders, responseBody } = await scheduler.request({ uri: label, headers, timeout, rejectUnauthorized: false })

        let server = responseHeaders['server']
        let contentType = responseHeaders['content-type']

        if (responseCode) {
            results.push({ type: CODE_TYPE, label: `${responseCode}/HTTP`, props: { code: responseCode }, edges: [{ source, type: FINGERPRINT_TYPE }] })
        }

        if (server) {
            server = server.trim()

            results.push({ type: SOFTWARE_TYPE, label: `${server}`, props: { server }, edges: [{ source, type: FINGERPRINT_TYPE }] })
        }

        if (contentType) {
            contentType = contentType.trim().toLowerCase()

            results.push({ type: STRING_TYPE, label: `${contentType}`, props: { contentType }, edges: [{ source, type: FINGERPRINT_TYPE }] })
        }

        const text = responseBody.toString().trim()

        if (text) {
            const titleMatch = text.match(/<title>([^<]+)/i)

            if (titleMatch) {
                const title = titleMatch[1]

                results.push({ type: TITLE_TYPE, label: `${title}`, props: { title }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            const generatorMatch = text.match(/<meta\s+name="generator"\s+content="(.+?)"|<meta\s+content="(.+?)"\s+name="generator"/i)

            if (generatorMatch) {
                const software = generatorMatch[1].toLowerCase()

                results.push({ type: SOFTWARE_TYPE, label: `${software}`, props: { software }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            const sha1 = crypto.createHash('sha1').update(JSON.stringify(text)).digest('hex')

            results.push({ type: SHA1_TYPE, label: sha1, props: { sha1 }, edges: [{ source, type: FINGERPRINT_TYPE }] })
        }

        return results
    }

    async run(items, { timeout = DEFAULT_TIMEOUT, concurrency = DEFAULT_CONCURRENCY }) {
        return await super.run(items, { timeout }, concurrency)
    }
}

module.exports = { httpFingerprint }
