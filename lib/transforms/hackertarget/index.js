const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const scheduler = new Scheduler()

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
        return ['domain', 'ipv4', 'ipv6']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            q: label
        })

        const { responseBody } = await scheduler.fetch(`http://api.hackertarget.com/reverseiplookup/?${query}`, this.headers)

        const text = responseBody.toString()

        const lines = text.trim().split('\n').map(line => line.trim().toLowerCase())

        if (lines.length === 0 || (lines.length === 1 && lines[0].indexOf(' ') >= 0)) {
            return []
        }

        return lines.map((domain) => {
            return { id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] }
        })
    }
}

module.exports = { hackertargetReverseIpLookup }
