const querystring = require('querystring')

const { Transform } = require('../../transform')
const { DOMAIN_TYPE, URI_TYPE } = require('../../types')

const archiveIndex = class extends Transform {
    static get alias() {
        return ['archive_index', 'arci']
    }

    static get title() {
        return 'Archive.org Index'
    }

    static get description() {
        return 'Obtain archive.org index for specific URL.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE, URI_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 100
    }

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            output: 'json',
            collapse: 'urlkey',
            url: label.replace(/\/?$/, '/*')
        })

        // TODO: perform the same search but over multiple indexes

        const { responseBody } = await this.scheduler.tryRequest({ uri: `http://web.archive.org/cdx/search/cdx?${query}` })

        const items = JSON.parse(responseBody)

        return items.slice(1).map(([_urlkey, timestamp, uri, mime, responseCode, _digest, _length]) => {
            timestamp = parseInt(timestamp)
            responseCode = parseInt(responseCode)

            return { type: URI_TYPE, label: uri, props: { uri, mime, responseCode, timestamp }, edges: [source] }
        })
    }
}

module.exports = { archiveIndex }
