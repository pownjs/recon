const querystring = require('querystring')

const { Transform } = require('../../transform')

const WAPPALYZER_APPLICATION_TYPE = 'wappalyzer:application'

const wappalyzerProfile = class extends Transform {
    static get alias() {
        return ['wappalyzer_profile', 'wzp']
    }

    static get title() {
        return 'Wappalyzer Profile'
    }

    static get description() {
        return 'Enumerate technologies with api.wappalyzer.com.'
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
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    headers = {
        'X-Api-Key': 'wappalyzer.api.demo.key'
    };

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            url: label
        })

        const { responseCode, responseBody } = await this.scheduler.tryRequest({ uri: `https://api.wappalyzer.com/lookup/v1/?${query}`, headers: this.headers })

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
