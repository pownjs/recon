const querystring = require('querystring')

const { isIpv4 } = require('../../detect')
const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE } = require('../../types')

const scheduler = new Scheduler()

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
        return {}
    }

    static get priority() {
        return 1
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

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            q: `.${label}`
        })

        const { responseBody } = await scheduler.tryFetch(`https://dns.bufferover.run/dns?${query}`, this.headers)

        const { FDNS_A, RDNS } = JSON.parse(responseBody.toString())

        const results = []

        ; // WTF?

        [FDNS_A || [], RDNS || []].forEach((category) => {
            category.forEach((item) => {
                let [ptr, domain] = item.split(',')

                if (!domain) {
                    domain = ptr
                    ptr = ''
                }

                const label = domain
                const type = DOMAIN_TYPE
                const id = this.makeId(type, label)

                results.push({ id, type, label, props: { domain, ipv4: (isIpv4(ptr) ? ptr : undefined) }, edges: [{ source, type: SUBDOMAIN_TYPE }] })

                if (ptr) {
                    if (isIpv4(ptr)) {
                        results.push({ type: IPV4_TYPE, label: ptr, props: { ipv4: ptr, domain }, edges: [id] })
                    }
                }
            })
        })

        return results
    }
}

module.exports = { bufferoverrunSubdomainSearch }
