const { sleep: timeout } = require('@pown/async/lib/sleep')

const { makeId } = require('../../lib//utils')
const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { ALL_TYPE, NICK_TYPE, DOMAIN_TYPE, EMAIL_TYPE, URI_TYPE, IPV4_TYPE, IPV6_TYPE, STRING_TYPE, BRAND_TYPE } = require('../../lib//types')

const noop = class extends Transform {
    static get alias() {
        return ['nop']
    }

    static get title() {
        return 'No Op'
    }

    static get description() {
        return 'Does not do anything'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return []
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

    async run() {
        return []
    }
}

const sleep = class extends Transform {
    static get alias() {
        return ['sleep', 'wait']
    }

    static get title() {
        return 'Sleep'
    }

    static get description() {
        return 'Sleeps for predefined time'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return []
    }

    static get options() {
        return {
            time: {
                type: 'number',
                description: 'The ammount of time to sleep in milliseconds',
                default: 60000
            }
        }
    }

    static get priority() {
        return 100
    }

    static get noise() {
        return 100
    }

    async run(nodes, options) {
        const { time = 60000 } = options

        await timeout(time)
    }
}

const duplicate = class extends Transform {
    static get alias() {
        return ['dup']
    }

    static get title() {
        return 'Duplicate'
    }

    static get description() {
        return 'Duplicate node'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [ALL_TYPE]
    }

    static get options() {
        return {
            newType: {
                type: 'string',
                description: 'Type of the new node',
                default: STRING_TYPE
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle(node, options) {
        const { newType = STRING_TYPE } = options

        const results = []

        results.push({ ...node, type: newType, id: makeId(), edges: [{ source: node.id, type: 'duplicate' }] })

        return results
    }
}

const extract = class extends Transform {
    static get alias() {
        return ['excavate']
    }

    static get title() {
        return 'Extract'
    }

    static get description() {
        return 'Extract property'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [ALL_TYPE]
    }

    static get options() {
        return {
            property: {
                type: 'string',
                description: 'The property to extract',
                default: ''
            },

            prefix: {
                type: 'string',
                description: 'Prefix for the label',
                default: ''
            },

            suffix: {
                type: 'string',
                description: 'Suffix for the label',
                default: ''
            },

            newType: {
                type: 'string',
                description: 'Type of the new node',
                default: STRING_TYPE
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '', props = {} }, options) {
        const { property = '', prefix = '', suffix = '', newType = STRING_TYPE } = options

        const results = []

        let value

        try {
            value = property.split('.').reduce((o, i) => o[i], props)
        }
        catch (e) {
            value = ''
        }

        if (value) {
            const newLabel = `${prefix}${value}${suffix}`

            results.push({
                type: newType,
                id: makeId(newType, newLabel),
                label: newLabel,
                props: {
                    [newType]: newLabel
                },
                edges: [{ source, type: 'extract' }]
            })
        }

        return results
    }
}

const prefix = class extends Transform {
    static get alias() {
        return ['prepand']
    }

    static get title() {
        return 'Prefix'
    }

    static get description() {
        return 'Creates a new node with a prefix'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [ALL_TYPE]
    }

    static get options() {
        return {
            prefix: {
                type: 'string',
                description: 'The prefix to add',
                default: ''
            },

            newType: {
                type: 'string',
                description: 'Type of the new node',
                default: STRING_TYPE
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, options) {
        const { prefix, newType = STRING_TYPE } = options

        const results = []

        if (prefix) {
            const newLabel = `${prefix}${label}`

            results.push({
                type: newType,
                id: makeId(newType, newLabel),
                label: newLabel,
                props: {
                    [newType]: newLabel
                },
                edges: [{ source, type: 'prefix' }]
            })
        }

        return results
    }
}

const suffix = class extends Transform {
    static get alias() {
        return ['append']
    }

    static get title() {
        return 'Suffix'
    }

    static get description() {
        return 'Creates a new node with a suffix'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [ALL_TYPE]
    }

    static get options() {
        return {
            suffix: {
                type: 'string',
                description: 'The suffix to add',
                default: ''
            },

            newType: {
                type: 'string',
                description: 'Type of the new node',
                default: STRING_TYPE
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, options) {
        const { suffix, newType = STRING_TYPE } = options

        const results = []

        if (suffix) {
            const newLabel = `${label}${suffix}`

            results.push({
                type: newType,
                id: makeId(newType, newLabel),
                label: newLabel,
                props: {
                    [newType]: newLabel
                },
                edges: [{ source, type: 'suffix' }]
            })
        }

        return results
    }
}

const augment = class extends Transform {
    static get alias() {
        return []
    }

    static get title() {
        return 'Augment'
    }

    static get description() {
        return 'Update node with prefix or suffix'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [ALL_TYPE]
    }

    static get options() {
        return {
            prefix: {
                type: 'string',
                description: 'The prefix to add',
                default: ''
            },

            suffix: {
                type: 'string',
                description: 'The suffix to add',
                default: ''
            },

            newType: {
                type: 'string',
                description: 'Type of the new node',
                default: STRING_TYPE
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, options) {
        const { prefix = '', suffix = '', newType = STRING_TYPE } = options

        const results = []

        if (prefix || suffix) {
            const newLabel = `${prefix}${label}${suffix}`

            results.push({
                type: newType,
                id: makeId(newType, newLabel),
                label: newLabel,
                label,
                props: {
                    [newType]: newLabel
                },
                edges: [{ source, type: 'augment' }]
            })
        }

        return results
    }
}

const splitEmail = class extends Transform {
    static get alias() {
        return ['split_email']
    }

    static get title() {
        return 'Split Email'
    }

    static get description() {
        return 'Split email at the @ sign'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [EMAIL_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }) {
        const [first, last] = label.split(/@/)

        const results = []

        if (first) {
            const nick = first

            results.push({ type: NICK_TYPE, label: nick, props: { nick }, edges: [source] })
        }

        if (last) {
            const domain = normalizeDomain(last)

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] })
        }

        return results
    }
}

const buildEmail = class extends Transform {
    static get alias() {
        return ['build_email']
    }

    static get title() {
        return 'Build Email'
    }

    static get description() {
        return 'Build email from node label'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            nick: {
                type: 'string',
                description: 'The email nick',
                default: 'admin'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, { nick = 'admin' }) {
        const email = `${nick}@${label}`

        const results = []

        results.push({ type: EMAIL_TYPE, label: email, props: { email }, edges: [source] })

        return results
    }
}

const splitDomain = class extends Transform {
    static get alias() {
        return ['split_domain']
    }

    static get title() {
        return 'Split Domain'
    }

    static get description() {
        return 'Split domain at the first dot'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
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
        return 1000
    }

    async handle({ id: source = '', label = '' }) {
        const [first, last] = label.split(/\./)

        const results = []

        if (first) {
            const brand = first

            results.push({ type: BRAND_TYPE, label: first, props: { brand }, edges: [source] })
        }

        if (last) {
            const domain = normalizeDomain(last)

            if (domain.index('.') > 0) {
                results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] })
            }
        }

        return results
    }
}

const buildDomain = class extends Transform {
    static get alias() {
        return ['build_domain']
    }

    static get title() {
        return 'Build Domain'
    }

    static get description() {
        return 'Build domain from node label'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            brand: {
                type: 'string',
                description: 'The brand',
                default: 'brand'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, { brand = 'brand' }) {
        const domain = normalizeDomain(`${brand}.${label}`)

        const results = []

        results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] })

        return results
    }
}

const splitUri = class extends Transform {
    static get alias() {
        return ['split_uri']
    }

    static get title() {
        return 'Split URI'
    }

    static get description() {
        return 'Split URI to corresponding parts'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [URI_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }) {
        const url = require('url')

        const { hostname } = url.parse(label)

        const results = []

        if (hostname) {
            const domain = normalizeDomain(hostname)

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] })
        }

        return results
    }
}

const buildUri = class extends Transform {
    static get alias() {
        return ['build_uri']
    }

    static get title() {
        return 'Build URI'
    }

    static get description() {
        return 'Build URI from node label'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            protocol: {
                type: 'string',
                description: 'The URI protocol',
                default: 'http'
            },

            port: {
                type: 'string',
                description: 'The URI port',
                default: ''
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, { protocol = 'http', port = '' }) {
        const url = require('url')

        const isHttp = protocol === 'http' && (!port || port === '80')
        const isHttps = protocol === 'https' && (!port || port === '443')

        const uri = url.format({ hostname: label, protocol: `${protocol}:`, port: isHttp || isHttps ? undefined : port })

        const results = []

        results.push({ type: URI_TYPE, label: uri, props: { uri }, edges: [source] })

        return results
    }
}

const bakeImages = class extends Transform {
    static get alias() {
        return ['bake_images', 'bes']
    }

    static get title() {
        return 'Bake Images'
    }

    static get description() {
        return 'Convert external image into data URIs for self-embedding purposes'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['image', 'screenshot', 'gravatar']
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle(item) {
        const { image } = item

        if (!image) {
            return
        }

        if (!/^https?:\/\//.test(image)) {
            return
        }

        const { responseBody } = await this.scheduler.tryRequest({ uri: image })

        if (!responseBody) {
            return
        }

        return { ...item, image: `data:text/plain;base64,${responseBody.toString('base64')}` }
    }
}

module.exports = {
    noop,
    sleep,
    duplicate,
    extract,
    prefix,
    suffix,
    augment,
    splitEmail,
    buildEmail,
    splitDomain,
    buildDomain,
    splitUri,
    buildUri,
    bakeImages
}
