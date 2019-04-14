const { Scheduler } = require('../../scheduler')
const { Transformer } = require('../../transformer')
const { URI_TYPE, STRING_TYPE } = require('../../types')

const DEFAULT_TIMEOUT = 5000
const DEFAULT_CONCURRENCY = Number.MAX_VALUE

const scheduler = new Scheduler()

const httpFingerprint = class extends Transformer {
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
                description: 'The socket timeout interval',
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

        const { responseCode, responseHeaders, responseBody } = await scheduler.fetch(label)

        const server = responseHeaders['server']
        const contentType = responseHeaders['content-type']

        if (responseCode) {
            results.push({ type: STRING_TYPE, label: `${responseCode}/HTTP`, props: { code: responseCode }, edges: [source] })
        }

        if (server) {
            results.push({ type: STRING_TYPE, label: `${server}`, props: { server }, edges: [source] })
        }

        if (contentType) {
            results.push({ type: STRING_TYPE, label: `${contentType}`, props: { contentType }, edges: [source] })
        }

        const text = responseBody.toString().trim()

        if (text) {
            const match = text.match(/<meta\s+name="generator"\s+content="(.*?)"|<meta\s+content="(.*?)"\s+name="generator"/i)

            if (match) {
                const softwareVersion = match[1].toLowerCase()

                results.push({ type: STRING_TYPE, label: `${softwareVersion}`, props: { softwareVersion }, edges: [source] })
            }
        }

        return results
    }

    async run(item, { timeout = DEFAULT_TIMEOUT, concurrency = DEFAULT_CONCURRENCY }) {
        return super.run(item, { timeout }, concurrency)
    }
}

module.exports = { httpFingerprint }
