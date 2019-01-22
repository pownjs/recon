const { fetch } = require('@pown/request')
const querystring = require('querystring')

const { Transformer } = require('../transformer')

const cloudflareDnsQuery = class extends Transformer {
    static get alias() {
        return ['cloudflare_dns_query', 'cfdq']
    }

    static get title() {
        return 'CloudFlare DNS Query'
    }

    static get description() {
        return 'Query CloudFlare DNS API'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {
            type: {
                description: 'Record type',
                default: 'A'
            }
        }
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown',
            'accept': 'application/dns-json'
        }
    }

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const { type } = options

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                name: label,
                type: type
            })

            const { responseBody } = await fetch(`https://cloudflare-dns.com/dns-query?${query}`, this.headers)

            const { Answer = [] } = JSON.parse(responseBody.toString())

            return Answer.map(({ type, data }) => {
                if (type === 1) {
                    const ipv4 = data

                    return { id: ipv4, type: 'ipv4', label: ipv4, props: { ipv4 }, edges: [target] }
                }
                else
                if (type === 2) {
                    const domain = data.slice(0, -1).toLowerCase()

                    return { id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] }
                }
                else
                if (type === 5) {
                    const domain = data.slice(0, -1).toLowerCase()

                    return { id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] }
                }
                else
                if (type === 15) {
                    const domain = data.split(' ')[1].slice(0, -1).toLowerCase()

                    return { id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] }
                }
                else
                if (type === 16) {
                    const string = data.slice(1, -1)

                    return { id: this.makeId(), type: 'string', label: string, props: { string }, edges: [target] }
                }
                else
                if (type === 28) {
                    const ipv6 = data

                    return { id: ipv6, type: 'ipv6', label: ipv6, props: { ipv6 }, edges: [target] }
                }
                else {
                    const string = data

                    return { id: this.makeId(), type: 'string', label: string, props: { string }, edges: [target] }
                }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { cloudflareDnsQuery }
