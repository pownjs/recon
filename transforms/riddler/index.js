const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { makeId, flatten } = require('../../lib//utils')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE } = require('../../lib//types')

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
        return 'Searches for IP references using F-Secure riddler.io'
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
                type: 'boolean',
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

            const { responseBody } = await this.scheduler.tryRequest({ uri: `https://riddler.io/search/exportcsv?${query}`, maxRetries: 5 })

            const lines = responseBody.toString().trim().split('\n').slice(2).filter(l => l).map(l => l.split(','))

            const ips = lines.map(([ipv4, _data, _c1, _c2, _country, _fqdn, _keywords, _pld, domain]) => {
                domain = normalizeDomain(domain)

                const ipId = makeId(IPV4_TYPE, ipv4)
                const domainId = makeId(DOMAIN_TYPE, domain)

                const results = []

                results.push({ id: ipId, type: IPV4_TYPE, label: ipv4, props: { ipv4, domain }, edges: [source] })

                if (!ignoreDomains) {
                    results.push({ id: domainId, type: DOMAIN_TYPE, label: domain, props: { domain, ipv4 }, edges: [ipId] })
                }

                return results
            })

            return [].concat(ips)
        }))

        return flatten(results, 3)
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
        return 'Searches for Domain references using F-Secure riddler.io'
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

            const { responseBody } = await this.scheduler.tryRequest({ uri: `https://riddler.io/search/exportcsv?${query}`, maxRetries: 5 })

            const lines = responseBody.toString().trim().split('\n').slice(2).filter(l => l).map(l => l.split(','))

            const ips = lines.map(([ipv4, _data, _c1, _c2, _country, fqdn, _keywords, _pld, domain]) => {
                domain = normalizeDomain(fqdn)

                const domainId = makeId(DOMAIN_TYPE, domain)
                const ipId = makeId(IPV4_TYPE, ipv4)

                const results = []

                results.push({ id: domainId, type: DOMAIN_TYPE, label: domain, props: { domain, ipv4 }, edges: [{ source, type: SUBDOMAIN_TYPE }] })

                if (!ignoreIps) {
                    results.push({ id: ipId, type: IPV4_TYPE, label: ipv4, props: { ipv4, domain }, edges: [domainId] })
                }

                return results
            })

            return [].concat(ips)
        }))

        return flatten(results, 3)
    }
}

module.exports = { riddlerIpSearch, riddlerDomainSearch }
