const querystring = require('querystring')

const { Transform } = require('../../transform')
const { normalizeDomain } = require('../../normalize')
const { BRAND_TYPE, DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const securitytrailsSuggestions = class extends Transform {
    static get alias() {
        return ['securitytrails_domain_suggestions', 'stds']
    }

    static get title() {
        return 'Security Trails Domain Suggestions'
    }

    static get description() {
        return 'Get a list of domain suggestions from securitytrails.com.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 9
    }

    async handle({ id: source = '', label = '' }) {
        const search = querystring.escape(label)

        const { suggestions = [] } = await this.scheduler.tryRequest({ uri: `https://securitytrails.com/app/api/autocomplete/domain/${search}`, toJson: true })

        return suggestions.map((domain) => {
            domain = normalizeDomain(domain)

            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] }
        })
    }
}

module.exports = { securitytrailsSuggestions }
