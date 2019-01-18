const crypto = require('crypto')
const querystring = require('querystring')

const { Transform } = require('../transform')

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

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const gravatar = crypto.createHash('md5').update(label).digest('hex')

            const query = querystring.stringify({
                s: 256,
                d: 'identicon'
            })

            const uri = `https://gravatar.com/avatar/${gravatar}?${query}`

            return { id: uri, type: 'gravatar', label, image: uri, props: { gravatar, uri }, edges: [target] }
        }))

        return this.flatten(results, 1)
    }
}

module.exports = { gravatar }
