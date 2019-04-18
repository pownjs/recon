const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')

const scheduler = new Scheduler()

const commoncrawlIndex = class extends Transform {
    static get alias() {
        return ['commoncrawl_index', 'cci']
    }

    static get title() {
        return 'CommonCrawl Index'
    }

    static get description() {
        return 'Obtain a CommonCraw index for specific URL.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['domain', 'uri']
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
            url: label.replace(/\/?$/, '/*')
        })

        // TODO: perform the same search but over multiple indexes

        const { responseBody } = await scheduler.tryFetch(`http://index.commoncrawl.org/CC-MAIN-2018-22-index?${query}`)

        const lines = responseBody.toString().trim().split('\n')

        return lines.map((line) => {
            const { url: uri, mime } = JSON.parse(line)

            return { type: 'uri', label: uri, props: { uri, mime }, edges: [source] }
        })
    }
}

module.exports = { commoncrawlIndex }
