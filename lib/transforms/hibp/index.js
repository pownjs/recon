const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const hibpReport = class extends Transformer {
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

        this.scheduler = new Scheduler()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const search = querystring.escape(label)
        const query = querystring.stringify({})

        const { responseBody } = await this.scheduler.fetch(`https://api.haveibeenpwned.com/unifiedsearch/${search}/?${query}`, this.headers)

        const { Breaches: breaches = [] } = JSON.parse(responseBody.toString())

        return breaches.map(({ Name: name, LogoPath: logoPath }) => {
            return { id: this.makeId('hvibp:report', name), type: 'hvibp:report', label: name, icon: logoPath, props: { name }, edges: [target] }
        })
    }
}

module.exports = { hibpReport }
