const { Transformer } = require('../../transformer')
const { NICK_TYPE, DOMAIN_TYPE } = require('../../types')

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

module.exports = { nop, splitEmail, splitUri }
