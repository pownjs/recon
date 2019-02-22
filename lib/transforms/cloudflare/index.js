const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, STRING_TYPE } = require('../../types')

const scheduler = new Scheduler()

const cloudflareDnsQuery = class extends Transformer {
    static get alias() {
        return ['cloudflare_dns_query', 'cfdq']
    }

    static get title() {
        return 'CloudFlare DNS Query'
    }

    static get description() {
        return 'Query CloudFlare DNS API.'
    }

    static get tags() {
        return ['dns']
    }

    static get types() {
        return [DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {
            type: {
                description: 'Record type',
                type: 'string',
                default: 'ALL',
                choices: ['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'NS']
            }
        }
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown',
            'accept': 'application/dns-json'
        }
    }

    async query(name, type, target) {
        const query = querystring.stringify({
            name: name,
            type: type
        })

        const { responseBody } = await scheduler.fetch(`https://cloudflare-dns.com/dns-query?${query}`, this.headers)

        const { Answer = [] } = JSON.parse(responseBody.toString())

        return Answer.map(({ type, data }) => {
            if (type === 1) {
                const ipv4 = data

                return { type: IPV4_TYPE, label: ipv4, props: { ipv4, type: 'A' }, edges: [target] }
            }
            else
            if (type === 2) {
                const domain = data.slice(0, -1).toLowerCase()

                return { type: 'domain', label: domain, props: { domain, type: 'NS' }, edges: [target] }
            }
            else
            if (type === 5) {
                const domain = data.slice(0, -1).toLowerCase()

                return { type: DOMAIN_TYPE, label: domain, props: { domain, type: 'CNAME' }, edges: [target] }
            }
            else
            if (type === 15) {
                const domain = data.split(' ')[1].slice(0, -1).toLowerCase()

                return { type: DOMAIN_TYPE, label: domain, props: { domain, type: 'MX' }, edges: [target] }
            }
            else
            if (type === 16) {
                const string = data.slice(1, -1)

                return { type: 'string', label: string, props: { string, type: 'TXT' }, edges: [target] }
            }
            else
            if (type === 28) {
                const ipv6 = data

                return { type: IPV6_TYPE, label: ipv6, props: { ipv6, type: 'AAAA' }, edges: [target] }
            }
            else {
                const string = data

                return { type: STRING_TYPE, label: string, props: { string }, edges: [target] }
            }
        })
    }

    async doAll(item) {
        const safe = async(func, ...args) => {
            try {
                return await func(...args)
            }
            catch (e) {
                if (process.env.POWN_DEBUG) {
                    console.error(e)
                }

                return []
            }
        }

        return [].concat(
            await safe(this.doA.bind(this), item),
            await safe(this.doAAAA.bind(this), item),
            await safe(this.doCNAME.bind(this), item),
            await safe(this.doNS.bind(this), item),
            await safe(this.doMX.bind(this), item),
            await safe(this.doTXT.bind(this), item)
        )
    }

    async doA({ id: target = '', label = '' }) {
        return this.query(label, 'A', target)
    }

    async doAAAA({ id: target = '', label = '' }) {
        return this.query(label, 'AAAA', target)
    }

    async doCNAME({ id: target = '', label = '' }) {
        return this.query(label, 'CNAME', target)
    }

    async doNS({ id: target = '', label = '' }) {
        return this.query(label, 'NS', target)
    }

    async doMX({ id: target = '', label = '' }) {
        return this.query(label, 'MX', target)
    }

    async doTXT({ id: target = '', label = '' }) {
        return this.query(label, 'TXT', target)
    }

    async handle(item, options) {
        const { type = 'ALL' } = options

        switch (type) {
            case 'ALL':
                return this.doAll(item)

            case 'A':
                return this.doA(item)

            case 'AAAA':
                return this.doAAAA(item)

            case 'CNAME':
                return this.doCNAME(item)

            case 'NS':
                return this.doNS(item)

            case 'MX':
                return this.doMX(item)

            case 'TXT':
                return this.doTXT(item)

            default:
                throw new Error(`Recognized record type ${type}`)
        }
    }
}

module.exports = { cloudflareDnsQuery }
