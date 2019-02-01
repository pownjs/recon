const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const scheduler = new Scheduler()

const archiveIndex = class extends Transformer {
    static get alias() {
        return ['archive_index', 'arci']
    }

    static get title() {
        return 'Archive.org Index'
    }

    static get description() {
        return 'Obtain a commoncraw index for specific URL.'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            output: 'json',
            collapse: 'urlkey',
            url: label.replace(/\/?$/, '/*')
        })

        // TODO: perform the same search but over multiple indexes

        const { responseBody } = await scheduler.fetch(`http://web.archive.org/cdx/search/cdx?${query}`)

        const items = JSON.parse(responseBody)

        return items.slice(1).map(([_urlkey, timestamp, uri, mime, responseCode, _digest, _length]) => {
            timestamp = parseInt(timestamp)
            responseCode = parseInt(responseCode)

            return { id: uri, type: 'uri', label: uri, props: { uri, mime, responseCode, timestamp }, edges: [target] }
        })
    }
}

module.exports = { archiveIndex }
