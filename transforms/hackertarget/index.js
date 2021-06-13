const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, PORT_TYPE } = require('../../lib//types')

const hackertargetReverseIpLookup = class extends Transform {
    static get alias() {
        return ['hackertarget_reverse_ip_lookup', 'htril']
    }

    static get title() {
        return 'HackerTarget Reverse IP Lookup'
    }

    static get description() {
        return 'Obtain reverse IP information from hackertarget.com'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {
            noiseThreshold: {
                description: 'The number of minimum nodes before considering the result set as noise',
                type: 'number',
                default: 100
            }
        }
    }

    static get priority() {
        return 100
    }

    static get noise() {
        return 9
    }

    async handle({ id: source = '', label = '', type: sourceType = '' }, options) {
        const { noiseThreshold = 100 } = options

        const query = querystring.stringify({
            q: label
        })

        const { responseBody } = await this.scheduler.tryRequest({ uri: `http://api.hackertarget.com/reverseiplookup/?${query}` })

        const text = responseBody.toString()

        if (/^\s*\<html/i.test(text)) {
            return []
        }

        const lines = text.trim().split('\n').map(line => line.trim().toLowerCase()).filter(line => line)

        if (lines.length === 0 || (lines.length === 1 && lines[0].indexOf(' ') >= 0)) {
            return []
        }

        if (lines.length > noiseThreshold) {
            this.warn(`query ${label} unlikely to produce specific results due to result set length (${lines.length}) greather than noise threshold (${noiseThreshold})`)

            return []
        }

        return lines.map((domain) => {
            domain = normalizeDomain(domain)

            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] }
        })
    }
}

const hackertargetOnlinePortScan = class extends Transform {
    static get alias() {
        return ['hackertarget_online_port_scan', 'htps']
    }

    static get title() {
        return 'HackerTarget Online Port Scan'
    }

    static get description() {
        return 'Obtain port information from hackertarget.com'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 100
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            q: label
        })

        const { responseBody } = await this.scheduler.tryRequest({ uri: `https://api.hackertarget.com/nmap/?${query}` })

        const text = responseBody.toString()

        if (/^\s*\<html/i.test(text)) {
            return []
        }

        const lines = text.trim().split('\n').map(line => line.trim().toLowerCase()).filter(line => line && /^\d+\/\w+\s+open\s+/.test(line))

        return lines.map((line) => {
            const [_label, _state, _service] = line.split(/\s+/)

            const label = _label.toUpperCase()

            const [port, protocol] = label.split('/')

            const state = _state.toLowerCase()
            const services = [_service.toLowerCase()]

            return { type: PORT_TYPE, label, props: { port, protocol, state, services }, edges: [source] }
        })
    }
}

module.exports = { hackertargetReverseIpLookup, hackertargetOnlinePortScan }
