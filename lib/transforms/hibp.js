const { fetch } = require('@pown/request')
const querystring = require('querystring')

const { Transform } = require('../transform')

const hibpReport = class extends Transform {
    static get alias() {
        return ['hibp_report', 'hibpr']
    }

    static get title() {
        return 'HIBP Report'
    }

    static get description() {
        return 'Obtain haveibeenpwned.com breach report.'
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
            const search = querystring.escape(label)
            const query = querystring.stringify({})

            const { responseBody } = await fetch(`https://api.haveibeenpwned.com/unifiedsearch/${search}/?${query}`, this.headers)

            const { Breaches: breaches = [] } = JSON.parse(responseBody.toString())

            return breaches.map(({ Name: name, LogoPath: logoPath }) => {
                return { id: this.makeId('hvibp:report', name), type: 'hvibp:report', label: name, icon: logoPath, props: { name }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { hibpReport }
