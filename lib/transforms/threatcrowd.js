const { fetch } = require('@pown/request')
const querystring = require('querystring')

const { Transform } = require('../transform')

const threatcrowdDomainReport = class extends Transform {
    static get alias() {
        return ['threatcrowd_domain_report']
    }

    static get title() {
        return 'Threatcrowd Domain Report'
    }

    static get description() {
        return 'Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses.'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                domain: label
            })

            const { responseBody } = await fetch(`https://www.threatcrowd.org/searchApi/v2/domain/report/?${query}`, this.headers)

            const { subdomains = [], emails = [] } = JSON.parse(responseBody.toString())

            console.log(JSON.stringify(JSON.parse(responseBody.toString())))

            const results = []

            subdomains.forEach((subdomain) => {
                subdomain = subdomain.trim().toLocaleLowerCase()

                if (!subdomain) {
                    return
                }

                results.push({ id: subdomain, type: 'subdomain', label: subdomain, props: { subdomain }, edges: [target] })
            })

            emails.forEach((email) => {
                email = email.trim().toLocaleLowerCase()

                if (!email) {
                    return
                }

                results.push({ id: email, type: 'email', label: email, props: { email }, edges: [target] })
            })

            return results
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { threatcrowdDomainReport }
