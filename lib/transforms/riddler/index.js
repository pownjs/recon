const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transformer } = require('../../transformer')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE } = require('../../types')

const scheduler = new Scheduler()

const riddlerIpSearch = class extends Transformer {
    static get alias() {
        return ['riddler_ip_search', 'rdis']
    }

    static get title() {
        return 'Riddler IP Search'
    }

    static get description() {
        return 'Searches for IP references using F-Secure riddler.io.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {}
    }

    async run(items, options) {
        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                q: `ip:${label}`
            })

            const { responseBody } = await scheduler.tryFetch(5, `https://riddler.io/search/exportcsv?${query}`, this.headers)

            const lines = responseBody.toString().trim().split('\n').slice(2).filter(l => l).map(l => l.split(','))

            const ips = lines.map(([ip, _data, _c1, _c2, _country, _fqdn, _keywords, _pld, domain]) => {
                const ipId = this.makeId(IPV4_TYPE, ip)
                const domainId = this.makeId(DOMAIN_TYPE, domain)

                return [
                    { id: ipId, type: IPV4_TYPE, label: ip, props: { ipv4: ip, domain }, edges: [target] },
                    { id: domainId, type: DOMAIN_TYPE, label: domain, props: { domain, ipv4: ip }, edges: [ipId] }
                ]
            })

            return [].concat(ips)
        }))

        return this.flatten(results, 3)
    }
}

const riddlerDomainSearch = class extends Transformer {
    static get alias() {
        return ['riddler_domain_search', 'rdds']
    }

    static get title() {
        return 'Riddler Domain Search'
    }

    static get description() {
        return 'Searches for Domain references using F-Secure riddler.io.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async run(items, options) {
        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                q: `pld:${label}`
            })

            const { responseBody } = await scheduler.tryFetch(5, `https://riddler.io/search/exportcsv?${query}`, this.headers)

            const lines = responseBody.toString().trim().split('\n').slice(2).filter(l => l).map(l => l.split(','))

            const ips = lines.map(([ip, _data, _c1, _c2, _country, fqdn, _keywords, _pld, domain]) => {
                const domainId = this.makeId(DOMAIN_TYPE, fqdn)
                const ipId = this.makeId(IPV4_TYPE, ip)

                return [
                    { id: domainId, type: DOMAIN_TYPE, label: fqdn, props: { domain: fqdn, ipv4: ip }, edges: [{ target, type: SUBDOMAIN_TYPE }] },
                    { id: ipId, type: IPV4_TYPE, label: ip, props: { ipv4: ip, domain: fqdn }, edges: [domainId] }
                ]
            })

            return [].concat(ips)
        }))

        return this.flatten(results, 3)
    }
}

module.exports = { riddlerIpSearch, riddlerDomainSearch }
