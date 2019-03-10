const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, PORT_TYPE } = require('../../types')

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

    static get tags() {
        return []
    }

    static get types() {
        return [DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE]
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

        const lines = text.trim().split('\n').map(line => line.trim().toLowerCase()).filter(line => line)

        if (lines.length === 0 || (lines.length === 1 && lines[0].indexOf(' ') >= 0)) {
            return []
        }

        return lines.map((domain) => {
            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [target] }
        })
    }
}

const hackertargetOnlinePortScan = class extends Transformer {
    static get alias() {
        return ['hackertarget_online_port_scan', 'htps']
    }

    static get title() {
        return 'HackerTarget Online Port Scan'
    }

    static get description() {
        return 'Obtain port information from hackertarget.com.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE]
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

        const { responseBody } = await scheduler.fetch(`https://api.hackertarget.com/nmap/?${query}`, this.headers)

        const text = responseBody.toString()

        const lines = text.trim().split('\n').map(line => line.trim().toLowerCase()).filter(line => line && /^\d+\/\w+\s+open\s+/.test(line))

        return lines.map((line) => {
            const [port, state, service] = line.split(/\s+/)

            return { type: PORT_TYPE, label: port, props: { port, state, service }, edges: [target] }
        })
    }
}

module.exports = { hackertargetReverseIpLookup, hackertargetOnlinePortScan }
