const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../lib//types')

const virustotalSubdomains = class extends Transform {
    static get alias() {
        return ['virustotal_subdomains', 'vtsd']
    }

    static get title() {
        return 'Virustotal Subdomains'
    }

    static get description() {
        return 'Obtain subdomains from Virustotal'
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
            limit: 40
        })

        const { data = [] } = await this.scheduler.tryRequest({ uri: `https://www.virustotal.com/ui/domains/${encodeURIComponent(label)}/subdomains?${query}`, toJson: true })

        return data.map(({ id }) => {
            const domain = normalizeDomain(id)

            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] }
        })
    }
}

module.exports = { virustotalSubdomains }
