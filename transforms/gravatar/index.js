const crypto = require('crypto')
const querystring = require('querystring')

const { Transform } = require('../../lib//transform')

const GRAVATAR_TYPE = 'gravatar'

const gravatar = class extends Transform {
    static get alias() {
        return []
    }

    static get title() {
        return 'Gravatar'
    }

    static get description() {
        return 'Get gravatar'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['email']
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

    async handle({ id: source = '', label = '' }, options) {
        const gravatar = crypto.createHash('md5').update(label).digest('hex')

        const query = querystring.stringify({
            s: 256,
            d: 'identicon'
        })

        const uri = `https://gravatar.com/avatar/${gravatar}?${query}`

        return [
            { type: GRAVATAR_TYPE, label, image: uri, props: { gravatar, uri }, edges: [source] }
        ]
    }
}

module.exports = { gravatar }
