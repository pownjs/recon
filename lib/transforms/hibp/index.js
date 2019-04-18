const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')

const HVIBP_REPORT_TYPE = 'hvibp:report'

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

    constructor() {
        super()

        this.scheduler = new Scheduler()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const search = querystring.escape(label)
        const query = querystring.stringify({})

        const { responseBody } = await this.scheduler.tryFetch(`https://api.haveibeenpwned.com/unifiedsearch/${search}/?${query}`, this.headers)

        const { Breaches: breaches = [] } = JSON.parse(responseBody.toString())

        return breaches.map(({ Name: name, LogoPath: logoPath, Description: description, BreachDate: date, DataClasses: dataClasses, ...rest }) => {
            return { type: HVIBP_REPORT_TYPE, label: name, image: logoPath, props: { name, description, date, dataClasses }, edges: [source] }
        })
    }
}

module.exports = { hibpReport }
