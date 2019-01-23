const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../transformer')

const scheduler = new Scheduler()

const WAPPALYZERAPPLICATION = 'wappalyzer:application'

const wappalyzerProfile = class extends Transformer {
    static get alias() {
        return ['wappalyzer_profile', 'wzp']
    }

    static get title() {
        return 'Wappalyzer Profile'
    }

    static get description() {
        return 'Enumerate technologies with api.wappalyzer.com'
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
            'X-Api-Key': 'wappalyzer.api.demo.key'
        }
    }

    async run(items, options) {
        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                url: label
            })

            const { responseCode, responseBody } = await scheduler.fetch(`https://api.wappalyzer.com/lookup/v1/?${query}`, this.headers)

            if (responseCode !== 200) {
                return []
            }

            const results = JSON.parse(responseBody.toString())

            const applications = Array.from(new Set(this.flatten(results.map(({ applications }) => {
                return applications.map(({ name }) => name)
            }), 1)))

            return applications.map((application) => {
                return { id: this.makeId(WAPPALYZERAPPLICATION, application), type: WAPPALYZERAPPLICATION, label: application, props: { application }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { wappalyzerProfile }
