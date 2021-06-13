const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../lib//types')

const certspotterIssuances = class extends Transform {
    static get alias() {
        return ['certspotter_issuances', 'csi']
    }

    static get title() {
        return 'Certspotter Issuances'
    }

    static get description() {
        return 'Obtain issuances from Certspotter'
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

        const items = await this.scheduler.tryRequest({ uri: `https://api.certspotter.com/v1/issuances?${query}`, toJson: true })

        return [].concat(...items.map(({ dns_names }) => {
            return dns_names
                .filter((name) => name.slice(-label.length - 1) === `.${label}`)
                .map((name) => name.replace(/^\*\./, ''))
                .filter((name) => name !== label)
                .map((name) => {
                    const domain = normalizeDomain(name)

                    return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] }
                })
        }))
    }
}

module.exports = { certspotterIssuances }
