const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const scheduler = new Scheduler()

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
            this.warn(`No spyse api key specified`)
        }

        const { pathname: p, query: q } = this.getCallOptions({ source, label }, options)

        const results = []

        let page = 1
        let count = 0

        while (true) {
            const query = querystring.stringify({
                ...q,

                api_token: spyseKey,

                page: page
            })

            this.info(`Retrieving spyse page ${page}`)

            const { responseBody } = await scheduler.tryFetch(`https://api.spyse.com/v1/${p.replace(/^\/+/, '')}?${query}`)

            const { records = [], count: total } = JSON.parse(responseBody.toString())

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
    static get alias() {
        return ['spyse_subdomains', 'ssds']
    }

    static get title() {
        return 'Spyse Subdomains'
    }

    static get description() {
        return 'Performs subdomain searching with Spyse.'
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
                description: 'Spyse API key.'
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
            pathname: '/subdomains',
            query: {
                domain: label
            }
        }
    }

    extractRecord({ source }, record) {
        const { domain } = record

        return {
            type: DOMAIN_TYPE,
            label: domain,
            props: { domain },
            edges: [{ source, type: SUBDOMAIN_TYPE }]
        }
    }
}

module.exports = { spyseSubdomains }
