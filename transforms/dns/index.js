const util = require('util')
const { Resolver } = require('dns')

const { flatten } = require('../../lib//utils')
const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, STRING_TYPE } = require('../../lib//types')

const DEFAULT_CONCURRENCY = 500

const dnsResolve = class extends Transform {
    static get alias() {
        return ['dns_resolve', 'dr', 'dns']
    }

    static get title() {
        return 'DNS Resolve'
    }

    static get description() {
        return 'Performs DNS resolution'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'local', 'dns']
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

    static get priority() {
        return 1
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
                if (!['ENOTFOUND', 'ENODATA'].includes(e.code)) {
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

    async doA({ id: source = '', label = '' }, resolve) {
        const records = await resolve(label, 'A')

        return records.filter(r => r).map((record) => {
            const ipv4 = record.toLowerCase()
            const domain = label

            return { type: IPV4_TYPE, label: record, props: { ipv4, type: 'A', domain }, edges: [source] }
        })
    }

    async doAAAA({ id: source = '', label = '' }, resolve) {
        const records = await resolve(label, 'AAAA')

        return records.filter(r => r).map((record) => {
            const ipv6 = record.toLowerCase()
            const domain = label

            return { type: IPV6_TYPE, label: record, props: { ipv6, type: 'AAAA', domain }, edges: [source] }
        })
    }

    async doCNAME({ id: source = '', label = '' }, resolve) {
        const records = await resolve(label, 'CNAME')

        return records.filter(r => r).map((record) => {
            const domain = normalizeDomain(record)
            const targetDomain = label

            return { type: DOMAIN_TYPE, label: record, props: { domain, type: 'CNAME', targetDomain }, edges: [source] }
        })
    }

    async doNS({ id: source = '', label = '' }, resolve) {
        const records = await resolve(label, 'NS')

        return records.filter(r => r).map((record) => {
            const domain = normalizeDomain(record)
            const targetDomain = label

            return { type: DOMAIN_TYPE, label: record, props: { domain, type: 'NS', targetDomain }, edges: [source] }
        })
    }

    async doMX({ id: source = '', label = '' }, resolve) {
        const records = await resolve(label, 'MX')

        return records.filter(({ exchange }) => exchange).map((record) => {
            const { exchange } = record

            const domain = normalizeDomain(exchange)
            const targetDomain = label

            return { type: DOMAIN_TYPE, label: domain, props: { domain, type: 'MX', targetDomain }, edges: [source] }
        })
    }

    async doTXT({ id: source = '', label = '' }, resolve) {
        const records = await resolve(label, 'TXT')

        const results = records.map((records) => {
            return records.filter(r => r).map((record) => {
                const string = record
                const domain = label

                return { type: STRING_TYPE, label: record, props: { string, type: 'TXT', domain }, edges: [source] }
            })
        })

        return flatten(results, 2)
    }

    async handle(item, options) {
        const { type = 'ALL', servers = '' } = options

        // TODO: Add the ability to interpolate options so that the resolver can be created only once.

        const resolver = new Resolver()

        if (servers) {
            const resolverServers = servers.split(',').map(s => s.trim()).filter(s => s)

            if (resolverServers.length) {
                console.warn(`using dns servers ${resolverServers.join(', ')}`)

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
