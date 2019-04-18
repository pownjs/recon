const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { BRAND_TYPE, ORG_TYPE, DOMAIN_TYPE, IPV4_TYPE, PORT_TYPE } = require('../../types')

const scheduler = new Scheduler()

class ShodanTransform extends Transform {
    getQuery() {
        throw new Error(`Not implemented`)
    }

    async handle({ id: source = '', label = '' }, { shodanKey = process.env.SHODAN_KEY }) {
        if (!shodanKey) {
            this.warn(`No shodan key supplied.`)

            return
        }

        const results = []

        let page = 1
        let count = 0

        while (true) {
            const query = querystring.stringify({
                key: shodanKey,
                query: this.getQuery(label),
                page: page
            })

            this.info(`Retrieving shodan page ${page}`)

            const { responseBody } = await scheduler.fetch(`https://api.shodan.io/shodan/host/search?${query}`)

            const { matches = [], total } = JSON.parse(responseBody.toString())

            if (!matches.length) {
                break
            }

            matches.forEach(({ ip_str: ipv4, port, ssl, hostnames }) => {
                const ipv4Id = this.makeId(IPV4_TYPE, ipv4)

                results.push({ id: ipv4Id, type: IPV4_TYPE, label: ipv4, props: { ipv4 }, edges: [source] })

                const portId = this.makeId(PORT_TYPE, port)

                results.push({ id: portId, type: PORT_TYPE, label: `${port}/TCP`, props: { port, ssl: ssl ? true : false }, edges: [ipv4Id] })

                hostnames.forEach((domain) => {
                    results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [ipv4Id] })
                })
            })

            count += matches.length

            if (count >= total) {
                break
            }

            page += 1
        }

        return results
    }
}

const shodanOrgSearch = class extends ShodanTransform {
    static get alias() {
        return ['shodan_org_search', 'sos']
    }

    static get title() {
        return 'Shodan ORG Search'
    }

    static get description() {
        return 'Performs search using ORG filter.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE, ORG_TYPE]
    }

    static get options() {
        return {
            shodanKey: {
                type: 'string',
                description: 'Shodan API key.'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 9
    }

    getQuery(label) {
        return `org:"${label}"`
    }
}

const shodanSslSearch = class extends ShodanTransform {
    static get alias() {
        return ['shodan_ssl_search', 'sss']
    }

    static get title() {
        return 'Shodan SSL Search'
    }

    static get description() {
        return 'Performs search using SSL filter.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE, BRAND_TYPE, ORG_TYPE]
    }

    static get options() {
        return {
            shodanKey: {
                type: 'string',
                description: 'Shodan API key.'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 9
    }

    getQuery(label) {
        return `ssl:"${label}"`
    }
}

module.exports = { shodanOrgSearch, shodanSslSearch }
