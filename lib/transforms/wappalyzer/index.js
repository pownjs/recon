const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const WAPPALYZER_APPLICATION_TYPE = 'wappalyzer:application'

const scheduler = new Scheduler()

const wappalyzerProfile = class extends Transformer {
    static get alias() {
        return ['wappalyzer_profile', 'wzp']
    }

    static get title() {
        return 'Wappalyzer Profile'
    }

    static get description() {
        return 'Enumerate technologies with api.wappalyzer.com.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['uri']
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
            'X-Api-Key': 'wappalyzer.api.demo.key'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
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
            return { type: WAPPALYZER_APPLICATION_TYPE, label: application, props: { application }, edges: [source] }
        })
    }
}

module.exports = { wappalyzerProfile }
