const querystring = require('querystring')

const { Transform } = require('../../transform')
const { isIpv4, isIpv6 } = require('../../detect')
const { normalizeDomain } = require('../../normalize')
const { BRAND_TYPE, ORG_TYPE, DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, PORT_TYPE } = require('../../types')

const SHODAN_REPORT_TYPE = 'shodan:report'

class ShodanTransform extends Transform {
    getQuery() {
        throw new Error(`Not implemented`)
    }

    filterMatch() {
        return true
    }

    async handle({ id: source = '', label = '' }, { shodanKey = process.env.SHODAN_KEY, ...options }) {
        if (!shodanKey) {
            throw new Error(`No shodan key supplied`)
        }

        const results = []

        let page = 1
        let count = 0

        for (;;) {
            const query = querystring.stringify({
                key: shodanKey,
                query: this.getQuery(label, options),
                page: page
            })

            this.info(`retrieving shodan page ${page}`)

            const { responseBody } = await this.scheduler.tryRequest({ uri: `https://api.shodan.io/shodan/host/search?${query}` })

            const { matches = [], total } = JSON.parse(responseBody.toString())

            if (!matches.length) {
                break
            }

            matches.forEach((match) => {
                if (!this.filterMatch(label, match)) {
                    return
                }

                const { _shodan, ip_str: ip, port, ssl, hostnames } = match

                const reportId = this.makeId(SHODAN_REPORT_TYPE, _shodan.id)

                results.push({
                    id: reportId,
                    type: SHODAN_REPORT_TYPE,
                    label: _shodan.id,
                    props: {
                        ...match
                    },
                    edges: [source]
                })

                const ipLabel = ip

                let ipType

                if (isIpv4(ip)) {
                    ipType = IPV4_TYPE
                }
                else
                if (isIpv6(ip)) {
                    ipType = IPV6_TYPE
                }
                else {
                    return
                }

                const ipId = this.makeId(ipType, ip)

                results.push({
                    id: ipId,
                    type: ipType,
                    label: ipLabel,
                    props: {
                        [ipType]: ip
                    },
                    edges: [reportId, source]
                })

                const portLabel = `${port}/TCP`

                const portId = this.makeId(PORT_TYPE, portLabel)

                results.push({ id: portId, type: PORT_TYPE, label: portLabel, props: { port, ssl: ssl ? true : false }, edges: [ipId] })

                hostnames.forEach((domain) => {
                    domain = normalizeDomain(domain)

                    results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [reportId, ipId, { source, type: SUBDOMAIN_TYPE }] })
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
    static get category() {
        return ['shodan']
    }

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
            },

            extraQuery: {
                type: 'string',
                description: 'Extra query.'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 50 // brand and org types can be quite noisy
    }

    getQuery(label, { extraQuery = '' }) {
        return `org:"${label}" ${extraQuery}`
    }
}

const shodanSslSearch = class extends ShodanTransform {
    static get category() {
        return ['shodan']
    }

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
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            shodanKey: {
                type: 'string',
                description: 'Shodan API key.'
            },

            extraQuery: {
                type: 'string',
                description: 'Extra query.'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 9
    }

    getQuery(label, { extraQuery = '' }) {
        return `ssl:"${label}" ${extraQuery}`
    }

    filterMatch(label, match) {
        const { ssl = {} } = match
        const { cert = {} } = ssl
        const { extensions = [], subject = {} } = cert

        const search = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        const regex = new RegExp(`(?:^|\\\\x11|\\.)${search}(?:\\\\x82|$)`)

        const matchesExtensions = extensions.some(({ data }) => regex.test(data || ''))

        const matchesSubject = regex.test(subject.CN || '')

        return matchesExtensions || matchesSubject
    }
}

module.exports = { shodanOrgSearch, shodanSslSearch }
