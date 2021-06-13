const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../lib//types')

class SpyseTransform extends Transform {
    getCallOptions() {
        throw new Error(`Not implemented`)
    }

    filterRecord() {
        return true
    }

    extractRecord() {
        throw new Error(`Not implemented`)
    }

    async handle({ id: source = '', label = '' }, { spyseKey = process.env.SPYSE_KEY, ...options }) {
        if (!spyseKey) {
            this.warn(`no spyse api key specified`)

            return
        }

        const { pathname: p, query: q } = this.getCallOptions({ source, label }, options)

        const results = []

        let page = 1
        let count = 0

        for (;;) {
            const query = querystring.stringify({
                ...q,

                page: page
            })

            this.info(`retrieving spyse page ${page}`)

            const headers = {
                Authorization: `Bearer ${spyseKey}`
            }

            const { records = [], count: total } = await this.scheduler.tryRequest({ uri: `https://api.spyse.com/v3/data/${p.replace(/^\/+/, '')}?${query}`, headers, toJson: true })

            if (!records.length) {
                break
            }

            records.forEach((record) => {
                if (!this.filterRecord({ source, label }, record)) {
                    return
                }

                results.push(this.extractRecord({ source, label }, record))
            })

            count += records.length

            if (count >= total) {
                break
            }

            page += 1
        }

        return results
    }
}

const spyseSubdomains = class extends SpyseTransform {
    static get category() {
        return ['shodan']
    }

    static get alias() {
        return ['spyse_subdomains', 'ssds']
    }

    static get title() {
        return 'Spyse Subdomains'
    }

    static get description() {
        return 'Performs subdomain searching with Spyse'
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
        return {
            spyseKey: {
                type: 'string',
                description: 'Spyse API key'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    getCallOptions({ label }) {
        return {
            pathname: '/domain/subdomain',
            query: {
                domain: label
            }
        }
    }

    extractRecord({ source }, record) {
        const { domain: _domain } = record

        const domain = normalizeDomain(_domain)

        return {
            type: DOMAIN_TYPE,
            label: domain,
            props: { domain },
            edges: [{ source, type: SUBDOMAIN_TYPE }]
        }
    }
}

module.exports = { spyseSubdomains }
