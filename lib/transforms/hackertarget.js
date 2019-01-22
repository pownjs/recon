const { fetch } = require('@pown/request')
const querystring = require('querystring')

const { Transformer } = require('../transformer')

const hackertargetReverseIpLookup = class extends Transformer {
    static get alias() {
        return ['hackertarget_reverse_ip_lookup', 'htril']
    }

    static get title() {
        return 'HackerTarget Reverse IP Lookup'
    }

    static get description() {
        return 'Obtain reverse IP information from hackertarget.com.'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                q: label
            })

            const { responseBody } = await fetch(`http://api.hackertarget.com/reverseiplookup/?${query}`, this.headers)

            const text = responseBody.toString()

            const lines = text.trim().split('\n').map(line => line.trim().toLowerCase())

            if (lines.length === 0 || (lines.length === 1 && lines[0].indexOf(' ') >= 0)) {
                return []
            }

            return lines.map((domain) => {
                return { id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { hackertargetReverseIpLookup }
