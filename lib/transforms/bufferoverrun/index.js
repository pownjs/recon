const querystring = require('querystring')

const { isIpv4 } = require('../../detect')
const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, IPV4_TYPE } = require('../../types')

const scheduler = new Scheduler()

const DEFAULT_IGNORE_IPS = true
const DEFAULT_ENTRIES_THRESHOLD = 1024 // NOTE: might want to remove this

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
            ignoreIps: {
                description: 'Ignore the provided IPs',
                type: 'number',
                default: DEFAULT_IGNORE_IPS
            },

            entriesThreshold: {
                description: 'Entries threshold',
                type: 'number',
                default: DEFAULT_ENTRIES_THRESHOLD
            }
        }
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

    async handle({ id: source = '', label = '' }, { ignoreIps = DEFAULT_IGNORE_IPS, entriesThreshold = DEFAULT_ENTRIES_THRESHOLD }) {
        const needle = `.${label}`

        const query = querystring.stringify({
            q: needle
        })

        const { responseBody } = await scheduler.tryFetch(`https://dns.bufferover.run/dns?${query}`, this.headers)

        const { FDNS_A, RDNS } = JSON.parse(responseBody.toString())

        const results = []

        ; // WTF?

        [FDNS_A || [], RDNS || []].forEach((category) => {
            let filter

            if (category.length >= entriesThreshold) {
                this.warn(`Filtering rdns entries due to total entries (${category.length}) > current treshold (${entriesThreshold})`)

                filter = (ptr, domain) => domain.startsWith(ptr.replace(/\./g, '-'))
            }
            else {
                filter = () => false
            }

            category.forEach((item) => {
                let [ptr, domain] = item.split(',')

                if (!domain) {
                    domain = ptr
                    ptr = ''
                }

                if (!domain.endsWith(needle)) {
                    return
                }

                if (filter(ptr, domain)) {
                    return
                }

                const label = domain
                const type = DOMAIN_TYPE
                const id = this.makeId(type, label)

                results.push({ id, type, label, props: { domain, ipv4: (!ignoreIps && isIpv4(ptr) ? ptr : undefined) }, edges: [{ source, type: SUBDOMAIN_TYPE }] })

                if (!ignoreIps) {
                    if (ptr) {
                        if (isIpv4(ptr)) {
                            results.push({ type: IPV4_TYPE, label: ptr, props: { ipv4: ptr, domain }, edges: [id] })
                        }
                    }
                }
            })
        })

        return results
    }
}

module.exports = { bufferoverrunSubdomainSearch }
