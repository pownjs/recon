const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../lib//types')

class ZonecruncherTransform extends Transform {
    getCallOptions() {
        throw new Error(`Not implemented`)
    }

    filterRecord() {
        return true
    }

    extractRecord() {
        throw new Error(`Not implemented`)
    }

    async handle({ id: source = '', label = '' }, { zonecruncherKey = process.env.ZONECRUNCHER_KEY, ...options }) {
        if (!zonecruncherKey) {
            throw new Error(`No zonecruncher api key specified`)
        }

        const { pathname: p, query: q } = this.getCallOptions({ source, label }, options)

        const query = querystring.stringify({
            ...q,

            token: zonecruncherKey
        })

        const { results = [] } = await this.scheduler.tryRequest({ uri: `https://zonecruncher.com/api/v1/${p.replace(/^\/+/, '')}?${query}`, toJson: true })

        const nodes = []

        results.forEach((result) => {
            if (!this.filterRecord({ source, label }, result)) {
                return
            }

            nodes.push(this.extractRecord({ source, label }, result))
        })

        return nodes
    }
}

const zonecruncherSubdomains = class extends ZonecruncherTransform {
    static get category() {
        return ['zonecruncher']
    }

    static get alias() {
        return ['zonecruncher_subdomains', 'zcss']
    }

    static get title() {
        return 'Zonecruncher Subdomains'
    }

    static get description() {
        return 'Performs subdomain searching with Zonecruncher'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            zonecruncherKey: {
                type: 'string',
                description: 'Zonecruncher API key'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    getCallOptions({ label }) {
        return {
            pathname: '/subdomains',
            query: {
                q: label,
                sort: 'last'
            }
        }
    }

    extractRecord({ source }, record) {
        const { qname, first_seen: firstSeen, last_seen: lastSeen } = record

        const domain = normalizeDomain(qname)

        return {
            type: DOMAIN_TYPE,
            label: domain,
            props: { domain, firstSeen, lastSeen },
            edges: [{ source, type: SUBDOMAIN_TYPE }]
        }
    }
}

module.exports = { zonecruncherSubdomains }
