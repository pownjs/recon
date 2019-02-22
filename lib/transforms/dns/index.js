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
                choices: ['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'NS']
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

    async doA({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'A')

        return records.map((record) => {
            return { type: DOMAIN_TYPE, label: record, props: { ipv4: record, type: 'A' }, edges: [target] }
        })
    }

    async doAAAA({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'AAAA')

        return records.map((record) => {
            return { type: DOMAIN_TYPE, label: record, props: { ipv6: record, type: 'AAAA' }, edges: [target] }
        })
    }

    async doCNAME({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'CNAME')

        return records.map((record) => {
            return { type: DOMAIN_TYPE, label: record, props: { domain: record, type: 'CNAME' }, edges: [target] }
        })
    }

    async doNS({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'NS')

        return records.map((record) => {
            return { type: DOMAIN_TYPE, label: record, props: { domain: record, type: 'NS' }, edges: [target] }
        })
    }

    async doMX({ id: target = '', label = '' }, resolve) {
        const records = await resolve(label, 'MX')

        return records.map((record) => {
            const { exchnage } = record

            return { type: DOMAIN_TYPE, label: exchnage, props: { domain: exchnage, type: 'MX' }, edges: [target] }
        })
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
                    await safe(this.doA, item, resolve),
                    await safe(this.doAAAA, item, resolve),
                    await safe(this.doCNAME, item, resolve),
                    await safe(this.doNS, item, resolve),
                    await safe(this.doMX, item, resolve)
                )

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

            default:
                throw new Error(`Recognized record type ${type}`)
        }
    }
}

module.exports = { dnsResolve }
