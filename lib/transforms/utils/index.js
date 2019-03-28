const { Transformer } = require('../../transformer')
const { NICK_TYPE, DOMAIN_TYPE, EMAIL_TYPE, URI_TYPE, IPV4_TYPE, IPV6_TYPE, STRING_TYPE, BRAND_TYPE } = require('../../types')

const nop = class extends Transformer {
    static get alias() {
        return []
    }

    static get title() {
        return 'No Op'
    }

    static get description() {
        return 'Does not do anything.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return []
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async run() {
        return []
    }
}

const splitEmail = class extends Transformer {
    static get alias() {
        return ['split_email', 'se']
    }

    static get title() {
        return 'Split Email'
    }

    static get description() {
        return 'Split email.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [EMAIL_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }) {
        const [nick, domain] = label.split(/@/)

        const results = []

        if (nick) {
            results.push(this.makeNode({ type: NICK_TYPE, label: nick, props: { nick }, edges: [source] }))
        }

        if (domain) {
            results.push(this.makeNode({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] }))
        }

        return results
    }
}

const buildEmail = class extends Transformer {
    static get alias() {
        return ['build_email', 'be']
    }

    static get title() {
        return 'Build Email'
    }

    static get description() {
        return 'Build email.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            protocol: {
                type: 'string',
                description: 'The email nick.',
                default: 'root'
            }
        }
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, { nick = 'admin' }) {
        const email = `${nick}@${label}`

        const results = []

        results.push(this.makeNode({ type: EMAIL_TYPE, label: email, props: { email }, edges: [source] }))

        return results
    }
}

const splitDomain = class extends Transformer {
    static get alias() {
        return ['split_domain', 'ss']
    }

    static get title() {
        return 'Split Domain'
    }

    static get description() {
        return 'Split domain.'
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

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }) {
        const [brand, domain] = label.split(/\./)

        const results = []

        if (brand) {
            results.push(this.makeNode({ type: BRAND_TYPE, label: brand, props: { brand }, edges: [source] }))
        }

        if (domain) {
            if (domain.index('.') > 0) {
                results.push(this.makeNode({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] }))
            }
        }

        return results
    }
}

const buildDomain = class extends Transformer {
    static get alias() {
        return ['build_domain', 'bd']
    }

    static get title() {
        return 'Build Domain'
    }

    static get description() {
        return 'Build domain.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            protocol: {
                type: 'string',
                description: 'The brand',
                default: 'brand'
            }
        }
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }, { brand = 'brand' }) {
        const domain = `${brand}@${label}`

        const results = []

        results.push(this.makeNode({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] }))

        return results
    }
}

const splitUri = class extends Transformer {
    static get alias() {
        return ['split_uri', 'su']
    }

    static get title() {
        return 'Split URI'
    }

    static get description() {
        return 'Split URI.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [URI_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1000
    }

    async handle({ id: source = '', label = '' }) {
        const url = require('url')

        const { hostname: domain } = url.parse(label)

        const results = []

        if (domain) {
            results.push(this.makeNode({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] }))
        }

        return results
    }
}

const buildUri = class extends Transformer {
    static get alias() {
        return ['build_uri', 'bu']
    }

    static get title() {
        return 'Build URI'
    }

    static get description() {
        return 'Build URI.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {
            protocol: {
                type: 'string',
                description: 'The URI protocol.',
                default: 'http'
            },

            port: {
                type: 'string',
                description: 'The URI port.',
                default: ''
            }
        }
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

        results.push(this.makeNode({ type: URI_TYPE, label: uri, props: { uri }, edges: [source] }))

        return results
    }
}

const analyzeIp = class extends Transformer {
    static get alias() {
        return ['analyze_ip', 'ai']
    }

    static get title() {
        return 'Analyze IP'
    }

    static get description() {
        return 'Analyze IP.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 5
    }

    async handle({ id: source = '', label = '' }) {
        const results = []

        // TODO: add code here

        return results
    }
}

module.exports = { nop, splitEmail, buildEmail, splitDomain, buildDomain, splitUri, buildUri, analyzeIp }
