const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transformer } = require('../../transformer')
const { BRAND_TYPE, COMPANY_TYPE, DOMAIN_TYPE, IPV4_TYPE, PORT_TYPE } = require('../../types')

const scheduler = new Scheduler()

const shodanSSLSearch = class extends Transformer {
    static get alias() {
        return ['shodan_ssl_search', 'sss']
    }

    static get title() {
        return 'Shodan SSL Search'
    }

    static get description() {
        return 'Performs search using SSL filter.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [DOMAIN_TYPE, BRAND_TYPE, COMPANY_TYPE]
    }

    static get options() {
        return {
            shodanKey: {
                type: 'string',
                description: 'Shodan API key.'
            }
        }
    }

    static get noise() {
        return 9
    }

    async handle({ id: source = '', label = '' }, { shodanKey = '' }) {
        if (!shodanKey) {
            this.warn(`No shodan key supplied.`)

            return
        }

        const query = querystring.stringify({
            key: shodanKey,
            query: `ssl:"${label}"`
        })

        const { responseBody } = await scheduler.fetch(`https://api.shodan.io/shodan/host/search?${query}`)

        const { matches = [] } = JSON.parse(responseBody.toString())

        const results = []

        matches.forEach(({ ip_str: ipv4, port, hostnames }) => {
            const ipv4Id = this.makeId(IPV4_TYPE, ipv4)

            results.push({ id: ipv4Id, type: IPV4_TYPE, label: ipv4, props: { ipv4 }, edges: [source] })

            const portId = this.makeId(PORT_TYPE, port)

            results.push({ id: portId, type: PORT_TYPE, label: port, props: { port, ssl: true }, edges: [ipv4Id] })

            hostnames.forEach((domain) => {
                results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [ipv4Id] })
            })
        })

        return results
    }
}

module.exports = { shodanSSLSearch }
