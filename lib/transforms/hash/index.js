const crypto = require('crypto')

const { Transform } = require('../../transform')
const { SHA1_TYPE, HASH_TYPE } = require('../../types')

const sha1Hash = class extends Transform {
    static get alias() {
        return ['sha1_hash', 'sha1']
    }

    static get title() {
        return 'SHA1 Hash'
    }

    static get description() {
        return 'Create SHA1 Hash'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['hash', 'crypto']
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
        const sha1 = crypto.createHash('sha1').update(label).digest('hex')

        return { type: SHA1_TYPE, label: sha1, props: { sha1 }, edges: [{ source, type: HASH_TYPE }] }
    }
}

module.exports = { sha1Hash }
