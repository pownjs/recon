const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, STRING_TYPE } = require('../../lib//types')

const cloudflareDnsQuery = class extends Transform {
    static get alias() {
        return ['cloudflare_dns_query', 'cfdq']
    }

    static get title() {
        return 'CloudFlare DNS Query'
    }

    static get description() {
        return 'Query CloudFlare DNS API'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'dns']
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
                choices: ['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT']
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async query(name, type, source) {
        const query = querystring.stringify({
            name: name,
            type: type
        })

        const headers = {
            'Accept': 'application/dns-json'
        }

        const { Answer = [] } = await this.scheduler.tryRequest({ uri: `https://cloudflare-dns.com/dns-query?${query}`, headers, toJson: true })

        return Answer.filter(({ data }) => data).map(({ type, data }) => {
            if (type === 1) {
                const ipv4 = data
                const domain = name

                return { type: IPV4_TYPE, label: ipv4, props: { ipv4, type: 'A', domain }, edges: [source] }
            }
            else
            if (type === 28) {
                const ipv6 = data
                const domain = name

                return { type: IPV6_TYPE, label: ipv6, props: { ipv6, type: 'AAAA', domain }, edges: [source] }
            }
            else
            if (type === 5) {
                const domain = normalizeDomain(data.slice(0, -1))
                const targetDomain = name

                return { type: DOMAIN_TYPE, label: domain, props: { domain, type: 'CNAME', targetDomain }, edges: [source] }
            }
            else
            if (type === 2) {
                const domain = data.slice(0, -1).toLowerCase()
                const targetDomain = name

                return { type: DOMAIN_TYPE, label: domain, props: { domain, type: 'NS', targetDomain }, edges: [source] }
            }
            else
            if (type === 15) {
                const domain = normalizeDomain(data.split(' ')[1].slice(0, -1))
                const targetDomain = name

                return { type: DOMAIN_TYPE, label: domain, props: { domain, type: 'MX', targetDomain }, edges: [source] }
            }
            else
            if (type === 16) {
                const string = data.slice(1, -1)
                const domain = name

                return { type: STRING_TYPE, label: string, props: { string, type: 'TXT', domain }, edges: [source] }
            }
            else {
                const string = data

                return { type: STRING_TYPE, label: string, props: { string }, edges: [source] }
            }
        })
    }

    async doAll(item) {
        const safe = async(func, ...args) => {
            try {
                return await func(...args)
            }
            catch (e) {
                console.error(e)

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

    async doA({ id: source = '', label = '' }) {
        return this.query(label, 'A', source)
    }

    async doAAAA({ id: source = '', label = '' }) {
        return this.query(label, 'AAAA', source)
    }

    async doCNAME({ id: source = '', label = '' }) {
        return this.query(label, 'CNAME', source)
    }

    async doNS({ id: source = '', label = '' }) {
        return this.query(label, 'NS', source)
    }

    async doMX({ id: source = '', label = '' }) {
        return this.query(label, 'MX', source)
    }

    async doTXT({ id: source = '', label = '' }) {
        return this.query(label, 'TXT', source)
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
                throw new Error(`Unrecognized record type ${type}`)
        }
    }
}

module.exports = { cloudflareDnsQuery }
