const util = require('util')
const { Resolver } = require('dns')

const { Transformer } = require('../../transformer')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, STRING_TYPE } = require('../../types')

const dnsResolve = class extends Transformer {
    static get alias() {
        return ['dr', 'dns']
    }

    static get title() {
        return 'DNS Resolve'
    }

    static get description() {
        return 'Does not do anything.'
    }

    static get tags() {
        return ['local', 'dns']
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
            },

            servers: {
                description: 'DNS servers',
                type: 'string',
                default: ''
            }
        }
    }

    static get noise() {
        return 1
    }

    async doAll(item, resolve) {
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
            await safe(this.doA.bind(this), item, resolve),
            await safe(this.doAAAA.bind(this), item, resolve),
            await safe(this.doCNAME.bind(this), item, resolve),
            await safe(this.doNS.bind(this), item, resolve),
            await safe(this.doMX.bind(this), item, resolve),
            await safe(this.doTXT.bind(this), item, resolve)
        )
    }

    async doA({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'A')

        return records.map((record) => {
            const ipv4 = record.toLowerCase()
            const domain = label

            return { type: IPV4_TYPE, label: record, props: { ipv4, type: 'A', domain }, edges: [target] }
        })
    }

    async doAAAA({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'AAAA')

        return records.map((record) => {
            const ipv6 = record.toLowerCase()
            const domain = label

            return { type: IPV6_TYPE, label: record, props: { ipv6, type: 'AAAA', domain }, edges: [target] }
        })
    }

    async doCNAME({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'CNAME')

        return records.map((record) => {
            const domain = record.toLowerCase()
            const targetDomain = label

            return { type: DOMAIN_TYPE, label: record, props: { domain, type: 'CNAME', targetDomain }, edges: [target] }
        })
    }

    async doNS({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'NS')

        return records.map((record) => {
            const domain = record.toLowerCase()
            const targetDomain = label

            return { type: DOMAIN_TYPE, label: record, props: { domain, type: 'NS', targetDomain }, edges: [target] }
        })
    }

    async doMX({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'MX')

        return records.map((record) => {
            const { exchange } = record

            const domain = exchange.toLowerCase()
            const targetDomain = label

            return { type: DOMAIN_TYPE, label: exchange, props: { domain, type: 'MX', targetDomain }, edges: [target] }
        })
    }

    async doTXT({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'TXT')

        const results = records.map((records) => {
            return records.map((record) => {
                const string = record
                const domain = label

                return { type: STRING_TYPE, label: record, props: { string, type: 'TXT', domain }, edges: [target] }
            })
        })

        return this.flatten(results, 2)
    }

    async handle(item, options) {
        const { type = 'ALL', servers = '' } = options

        // TODO: Add the ability to interpolate options so that the resolver can be created only once.

        const resolver = new Resolver()

        if (servers) {
            const resolverServers = servers.split(',').map(s => s.trim()).filter(s => s)

            if (resolverServers.length) {
                console.warn(`Using dns servers ${resolverServers.join(', ')}`)

                resolver.setServers(resolverServers)
            }
        }

        const resolve = util.promisify(resolver.resolve.bind(resolver))

        switch (type) {
            case 'ALL':
                return this.doAll(item, resolve)

            case 'A':
                return this.doA(item, resolve)

            case 'AAAA':
                return this.doAAAA(item, resolve)

            case 'CNAME':
                return this.doCNAME(item, resolve)

            case 'NS':
                return this.doNS(item, resolve)

            case 'MX':
                return this.doMX(item, resolve)

            case 'TXT':
                return this.doTXT(item, resolve)

            default:
                throw new Error(`Recognized record type ${type}`)
        }
    }
}

module.exports = { dnsResolve }
