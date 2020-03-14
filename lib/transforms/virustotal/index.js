const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { normalizeDomain } = require('../../normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const scheduler = new Scheduler()

const virustotalSubdomains = class extends Transform {
    static get alias() {
        return ['virustotal_subdomains', 'vtsd']
    }

    static get title() {
        return 'Virustotal Subdomains'
    }

    static get description() {
        return 'Obtain subdomains from Virustotal.'
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

        const { responseBody } = await scheduler.tryFetch(`https://www.virustotal.com/ui/domains/${encodeURIComponent(label)}/subdomains?${query}`)

        const { data } = JSON.parse(responseBody)

        return data.map(({ id }) => {
            const domain = normalizeDomain(id)

            return { type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] }
        })
    }
}

module.exports = { virustotalSubdomains }
