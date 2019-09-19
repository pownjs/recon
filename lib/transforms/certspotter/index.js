const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const scheduler = new Scheduler()

const certspotterIssuances = class extends Transform {
    static get alias() {
        return ['certspotter_issuances', 'csi']
    }

    static get title() {
        return 'Certspotter Issuances'
    }

    static get description() {
        return 'Obtain issuances from Certspotter.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE]
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

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            domain: label,
            include_subdomains: 'true',
            expand: 'dns_names'
        })

        const { responseBody } = await scheduler.tryFetch(`https://api.certspotter.com/v1/issuances?${query}`)

        const items = JSON.parse(responseBody)

        return [].concat(...items.map(({ dns_names }) => {
            return dns_names
                .filter((name) => name.slice(-label.length - 1) === `.${label}`)
                .map((name) => name.replace(/^\*\./, ''))
                .filter((name) => name !== label)
                .map((name) => {
                    return { type: DOMAIN_TYPE, label: name, props: { domain: name }, edges: [{ source, type: SUBDOMAIN_TYPE }] }
                })
        }))
    }
}

module.exports = { certspotterIssuances }
