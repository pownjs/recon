const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')
const { BRAND_TYPE, DOMAIN_TYPE } = require('../../types')

const scheduler = new Scheduler()

const securitytrailsSuggestions = class extends Transformer {
    static get alias() {
        return ['securitytrails_domain_suggestions', 'stds']
    }

    static get title() {
        return 'Security Trails Domain Suggestions'
    }

    static get description() {
        return 'Get a list of domain suggestions from securitytrails.com.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [BRAND_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 9
    }

    async handle({ id: target = '', label = '' }) {
        const search = querystring.escape(label)

        const { responseBody } = await scheduler.fetch(`https://securitytrails.com/app/api/autocomplete/domain/${search}`)

        const { suggestions = [] } = JSON.parse(responseBody.toString()) || {}

        return suggestions.map((domain) => {
            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [target] }
        })
    }
}

const securitytrailsDomainReport = class extends Transformer {
    static get alias() {
        return ['securitytrails_domain_report', 'stdr']
    }

    static get title() {
        return 'Securitytrails Domain Report'
    }

    static get description() {
        return 'Get a domain report from securitytrails.com.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async handle({ id: target = '', label = '' }) {
        const search = querystring.escape(label)

        const { responseBody } = await scheduler.request({ method: 'POST', uri: `https://securitytrails.com/app/api/domain/info/${search}` })

        const { result = {} } = JSON.parse(responseBody.toString()) || {}

        const { subdomains = [] } = result

        const subdomainsResults = subdomains.map((domain) => {
            domain = `${domain}.${label}`
            domain = domain.replace(/\.+/, '.')

            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [target] }
        })

        return [].concat(subdomainsResults)
    }
}

module.exports = { securitytrailsSuggestions, securitytrailsDomainReport }
