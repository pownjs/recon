const crypto = require('crypto')
const querystring = require('querystring')

const { Transformer } = require('../../transformer')

const GRAVATAR_TYPE = 'gravatar'

const gravatar = class extends Transformer {
    static get alias() {
        return []
    }

    static get title() {
        return 'Gravatar'
    }

    static get description() {
        return 'Get gravatar.'
    }

    static get types() {
        return ['email']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const gravatar = crypto.createHash('md5').update(label).digest('hex')

        const query = querystring.stringify({
            s: 256,
            d: 'identicon'
        })

        const uri = `https://gravatar.com/avatar/${gravatar}?${query}`

        return [
            { id: uri, type: GRAVATAR_TYPE, label, image: uri, props: { gravatar, uri }, edges: [target] }
        ]
    }
}

module.exports = { gravatar }
