const { WhoAreThey } = require('@pown/whoarethey')

const { Transformer } = require('../../transformer')
const { NICK_TYPE, BRAND_TYPE } = require('../../types')

const WHOARETHEY_ACCOUNT_TYPE = 'whoarethey:account'

const whoaretheyReport = class extends Transformer {
    static get alias() {
        return ['whoarethey_report', 'whoarethey', 'wmnr', 'wmn']
    }

    static get title() {
        return 'WhoAreThey Report'
    }

    static get description() {
        return 'Find social accounts with the help of whoarethey database.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [NICK_TYPE, BRAND_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 5
    }

    async handle({ id: source = '', label = '' }, options) {
        const results = []

        const w = new WhoAreThey()

        w.on('info', this.info.bind(this))
        w.on('warn', this.warn.bind(this))
        w.on('error', this.error.bind(this))

        for (let { name, category, uri, prettyUri } of await w.fingerprint(label)) {
            results.push({ type: WHOARETHEY_ACCOUNT_TYPE, label: `${label}@${name}`, props: { category, uri, prettyUri }, edges: [source] })
        }

        return results
    }
}

module.exports = { whoaretheyReport }
