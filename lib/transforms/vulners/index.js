const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { SOFTWARE_TYPE, ISSUE_TYPE } = require('../../types')

const scheduler = new Scheduler()

const vulnersSearch = class extends Transform {
    static get alias() {
        return ['vulners_search', 'vs']
    }

    static get title() {
        return 'Vulners Search'
    }

    static get description() {
        return 'Obtain vulnerability information via vulners.com.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [SOFTWARE_TYPE]
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

    async handle({ id: source = '', label = '' }, options) {
        const tokens = label.split(/((?:\d+\.?)+)/)

        const software = (tokens[0] || '').replace(/\W+/g, '').toLowerCase().trim()
        const version = (tokens[1] || '').trim()

        if (!software || !version) {
            return
        }

        const query = querystring.stringify({ software, version, type: 'software' })

        const { responseBody } = await scheduler.tryFetch(`https://vulners.com/api/v3/burp/software/?${query}`, this.headers)

        const { data = {} } = JSON.parse(responseBody.toString())
        const { search = [] } = data

        const results = []

        search.forEach(({ _source }) => {
            const { title, description, cvss } = _source || {}
            const { score } = cvss || {}

            const scoreValue = parseFloat(score)

            let severity

            if (scoreValue >= 9.0) {
                severity = 'Critical'
            }
            else
            if (scoreValue >= 7.0) {
                severity = 'High'
            }
            else
            if (scoreValue >= 4.0) {
                severity = 'Medium'
            }
            else
            if (scoreValue >= 0.1) {
                severity = 'Low'
            }
            else {
                severity = 'Informational'
            }

            results.push({
                type: ISSUE_TYPE,
                label: title,
                props: {
                    description: description,
                    cvss: score,
                    severity: severity
                },
                edges: [source]
            })
        })

        return results
    }
}

module.exports = { vulnersSearch }
