const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { SOFTWARE_TYPE, ISSUE_TYPE, EXPLOIT_TYPE } = require('../../lib//types')

const vulnersSearch = class extends Transform {
    static get alias() {
        return ['vulners_search', 'vs']
    }

    static get title() {
        return 'Vulners Search'
    }

    static get description() {
        return 'Obtain vulnerability information via vulners.com'
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
        return {
            family: {
                description: 'Bulletin family',
                type: 'string',
                default: '',
                choices: [
                    '',
                    'exploit',
                    'nvd'
                ]
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const { family } = options

        const tokens = label.split(/((?:\d+\.?)+)/)

        const software = (tokens[0] || '').replace(/\W+/g, '').toLowerCase().trim()
        const version = (tokens[1] || '').trim()

        if (!software || !version) {
            return
        }

        const query = querystring.stringify({ software, version, type: 'software' })

        const { data = {} } = await this.scheduler.tryRequest({ uri: `https://vulners.com/api/v3/burp/software/?${query}`, toJson: true })

        const { search = [] } = data

        const results = []

        search.forEach(({ _source }) => {
            const { id, title, description, cvss, bulletinFamily } = _source || {}
            const { score } = cvss || {}

            if (family) {
                if (family !== bulletinFamily.toLowerCase()) {
                    return
                }
            }

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

            if (bulletinFamily === 'NVD') {
                results.push({
                    type: ISSUE_TYPE,
                    id: id,
                    label: title,
                    props: {
                        description: description,
                        cvss: score,
                        severity: severity
                    },
                    edges: [source]
                })
            }
            else {
                results.push({
                    type: EXPLOIT_TYPE,
                    id: id,
                    label: title,
                    props: {
                        description: description,
                        cvss: score,
                        severity: severity
                    },
                    edges: [source]
                })
            }
        })

        return results
    }
}

module.exports = { vulnersSearch }
