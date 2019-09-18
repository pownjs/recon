const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE } = require('../../types')

const scheduler = new Scheduler()

const DEFAULT_IGNORE_DOMAINS = true
const DEFAULT_IGNORE_IPS = true

const riddlerIpSearch = class extends Transform {
    static get alias() {
        return ['riddler_ip_search', 'rdis']
    }

    static get title() {
        return 'Riddler IP Search'
    }

    static get description() {
        return 'Searches for IP references using F-Secure riddler.io.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {
            ignoreDomains: {
                description: 'Ignore the provided domains',
                type: 'number',
                default: DEFAULT_IGNORE_DOMAINS
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async run(items, { ignoreDomains = DEFAULT_IGNORE_DOMAINS }) {
        const results = await Promise.all(items.map(async({ id: source = '', label = '' }) => {
            const query = querystring.stringify({
                q: `ip:${label}`
            })

            const { responseBody } = await scheduler.tryFetch(5, `https://riddler.io/search/exportcsv?${query}`, this.headers)

            const lines = responseBody.toString().trim().split('\n').slice(2).filter(l => l).map(l => l.split(','))

            const ips = lines.map(([ip, _data, _c1, _c2, _country, _fqdn, _keywords, _pld, domain]) => {
                const ipId = this.makeId(IPV4_TYPE, ip)
                const domainId = this.makeId(DOMAIN_TYPE, domain)

                const results = []

                results.push({ id: ipId, type: IPV4_TYPE, label: ip, props: { ipv4: ip, domain }, edges: [source] })

                if (!ignoreDomains) {
                    results.push({ id: domainId, type: DOMAIN_TYPE, label: domain, props: { domain, ipv4: ip }, edges: [ipId] })
                }

                return results
            })

            return [].concat(ips)
        }))

        return this.flatten(results, 3)
    }
}

const riddlerDomainSearch = class extends Transform {
    static get alias() {
        return ['riddler_domain_search', 'rdds']
    }

    static get title() {
        return 'Riddler Domain Search'
    }

    static get description() {
        return 'Searches for Domain references using F-Secure riddler.io.'
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
            ignoreIps: {
                description: 'Ignore the provided IPs',
                type: 'boolean',
                default: DEFAULT_IGNORE_IPS
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async run(items, { ignoreIps = DEFAULT_IGNORE_IPS }) {
        const results = await Promise.all(items.map(async({ id: source = '', label = '' }) => {
            const query = querystring.stringify({
                q: `pld:${label}`
            })

            const { responseBody } = await scheduler.tryFetch(5, `https://riddler.io/search/exportcsv?${query}`, this.headers)

            const lines = responseBody.toString().trim().split('\n').slice(2).filter(l => l).map(l => l.split(','))

            const ips = lines.map(([ip, _data, _c1, _c2, _country, fqdn, _keywords, _pld, domain]) => {
                const domainId = this.makeId(DOMAIN_TYPE, fqdn)
                const ipId = this.makeId(IPV4_TYPE, ip)

                const results = []

                results.push({ id: domainId, type: DOMAIN_TYPE, label: fqdn, props: { domain: fqdn, ipv4: ip }, edges: [{ source, type: SUBDOMAIN_TYPE }] })

                if (!ignoreIps) {
                    results.push({ id: ipId, type: IPV4_TYPE, label: ip, props: { ipv4: ip, domain: fqdn }, edges: [domainId] })
                }

                return results
            })

            return [].concat(ips)
        }))

        return this.flatten(results, 3)
    }
}

module.exports = { riddlerIpSearch, riddlerDomainSearch }
