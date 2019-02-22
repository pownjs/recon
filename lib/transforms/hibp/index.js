const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const HVIBP_REPORT_TYPE = 'hvibp:report'

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

    static get tags() {
        return []
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

        return breaches.map(({ Name: name, LogoPath: logoPath, Description: description, BreachDate: date, DataClasses: dataClasses, ...rest }) => {
            console.log(rest)
            return { type: HVIBP_REPORT_TYPE, label: name, image: logoPath, props: { name, description, date, dataClasses }, edges: [target] }
        })
    }
}

module.exports = { hibpReport }
