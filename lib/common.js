const { isDomain } = require('./detect')
const { Transform } = require('./transform')
const { normalizeDomain } = require('./normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('./types')

class SubdomainTransform extends Transform {
    async handle({ id: source = '', label = '' }) {
        let { subdomains, ...rest } = await this.getResults(label)

        const results = subdomains
            .filter(({ subdomain }) => subdomain)
            .map(({ subdomain, ...props }) => ({ subdomain: normalizeDomain(subdomain), ...props }))
            .filter(({ subdomain }) => subdomain && isDomain(subdomain) && subdomain.endsWith(`.${label}`))
            .map(({ subdomain, ...props }) => ({ type: DOMAIN_TYPE, label: subdomain, props: { domain: subdomain, ...props }, edges: [{ source, type: SUBDOMAIN_TYPE }] }))

        results.push(...Object.values(rest).filter(value => Array.isArray(value)))

        return results
    }
}

module.exports = { SubdomainTransform }
