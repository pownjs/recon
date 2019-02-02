const { Transformer } = require('../../transformer')
const { NICK_TYPE, DOMAIN_TYPE, EMAIL_TYPE, URI_TYPE } = require('../../types')

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
        return ['se']
    }

    static get title() {
        return 'Split Email'
    }

    static get description() {
        return 'Split email.'
    }

    static get types() {
        return ['email']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 20
    }

    async handle({ id: target = '', label = '' }) {
        const [ nick, domain ] = label.split(/@/)

        const results = []

        if (nick) {
            results.push(this.makeNode({ type: NICK_TYPE, label: nick, props: { nick }, edges: [target] }))
        }

        if (domain) {
            results.push(this.makeNode({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [target] }))
        }

        return results
    }
}

const buildEmail = class extends Transformer {
    static get alias() {
        return ['be']
    }

    static get title() {
        return 'Build Email'
    }

    static get description() {
        return 'Build email.'
    }

    static get types() {
        return ['domain']
    }

    static get options() {
        return {
            protocol: {
                type: 'nick',
                description: 'The email nick.',
                default: 'root'
            }
        }
    }

    static get noise() {
        return 20
    }

    async handle({ id: target = '', label = '' }, { nick = 'admin' }) {
        const email = `${nick}@${label}`

        const results = []

        results.push(this.makeNode({ type: EMAIL_TYPE, label: email, props: { email }, edges: [target] }))

        return results
    }
}

const splitUri = class extends Transformer {
    static get alias() {
        return ['su']
    }

    static get title() {
        return 'Split URI'
    }

    static get description() {
        return 'Split URI.'
    }

    static get types() {
        return ['uri']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 20
    }

    async handle({ id: target = '', label = '' }) {
        const url = require('url')

        const { hostname: domain } = url.parse(label)

        const results = []

        if (domain) {
            results.push(this.makeNode({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [target] }))
        }

        return results
    }
}

const buildUri = class extends Transformer {
    static get alias() {
        return ['bu']
    }

    static get title() {
        return 'Build URI'
    }

    static get description() {
        return 'Build URI.'
    }

    static get types() {
        return ['domain']
    }

    static get options() {
        return {
            protocol: {
                type: 'string',
                description: 'The URI protocol.',
                default: 'http'
            }
        }
    }

    static get noise() {
        return 20
    }

    async handle({ id: target = '', label = '' }, { protocol = 'http' }) {
        const url = require('url')

        const uri = url.format({ hostname: label, protocol: `${protocol}:` })

        const results = []

        results.push(this.makeNode({ type: URI_TYPE, label: uri, props: { uri }, edges: [target] }))

        return results
    }
}

module.exports = { nop, splitEmail, buildEmail, splitUri, buildUri }
