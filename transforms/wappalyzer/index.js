const querystring = require('querystring')

const { flatten } = require('../../lib//utils')
const { Transform } = require('../../lib//transform')

const WAPPALYZER_APPLICATION_TYPE = 'wappalyzer:application'

const wappalyzerProfile = class extends Transform {
    static get alias() {
        return ['wappalyzer_profile', 'wzp']
    }

    static get title() {
        return 'Wappalyzer Profile'
    }

    static get description() {
        return 'Enumerate technologies with api.wappalyzer.com'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['uri']
    }

    static get options() {
        return {
            wappalyzerKey: {
                type: 'string',
                description: 'Shodan API key'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, { wappalyzerKey = process.env.WAPPALYZER_KEY || 'wappalyzer.api.demo.key' }) {
        const query = querystring.stringify({
            url: label
        })

        const headers = {
            'X-Api-Key': wappalyzerKey
        }

        const results = await this.scheduler.tryRequest({ uri: `https://api.wappalyzer.com/lookup/v1/?${query}`, headers, toJson: true })

        if (!Array.isArray(results)) {
            return
        }

        const applications = Array.from(new Set(flatten(results.map(({ applications }) => {
            return applications.map(({ name }) => name)
        }), 1)))

        return applications.map((application) => {
            return { type: WAPPALYZER_APPLICATION_TYPE, label: application, props: { application }, edges: [source] }
        })
    }
}

module.exports = { wappalyzerProfile }
