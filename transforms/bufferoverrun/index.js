const querystring = require('querystring')

const { makeId } = require('../../lib//utils')
const { isIpv4 } = require('../../lib//detect')
const { Transform } = require('../../lib//transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE } = require('../../lib//types')

const DEFAULT_EXTRACT_IPS = false

const bufferoverrunSubdomainSearch = class extends Transform {
    static get alias() {
        return ['bufferoverrun_subdomain_search', 'brss']
    }

    static get title() {
        return 'Bufferover.run Subdomain Search'
    }

    static get description() {
        return 'Obtain a list of subdomains using bufferover.run DNS service'
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
            extractIps: {
                description: 'Extract IPs',
                type: 'boolean',
                default: DEFAULT_EXTRACT_IPS
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, { extractIps = DEFAULT_EXTRACT_IPS }) {
        const needle = `.${label}`

        const query = querystring.stringify({
            q: needle
        })

        const { FDNS_A, RDNS } = await this.scheduler.tryRequest({ uri: `https://dns.bufferover.run/dns?${query}`, toJson: true })

        const results = []

        ; // WTF?

        [FDNS_A || [], RDNS || []].forEach((category) => {
            category.forEach((item) => {
                let [ptr, domain] = item.split(',')

                if (!domain) {
                    domain = ptr
                    ptr = ''
                }

                if (!domain.endsWith(needle)) {
                    return
                }

                const label = domain
                const type = DOMAIN_TYPE
                const id = makeId(type, label)

                results.push({ id, type, label, props: { domain, ...{ previouslySeenIPv4: (ptr && isIpv4(ptr) ? ptr : undefined) } }, edges: [{ source, type: SUBDOMAIN_TYPE }] })

                if (extractIps && ptr && isIpv4(ptr)) {
                    results.push({ type: IPV4_TYPE, label: ptr, props: { ipv4: ptr, domain }, edges: [id] })
                }
            })
        })

        return results
    }
}

module.exports = { bufferoverrunSubdomainSearch }
