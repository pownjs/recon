const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../transformer')

const threatcrowdDomainReport = class extends Transformer {
    static get alias() {
        return ['threatcrowd_domain_report', 'tcdr']
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

        this.scheduler = new Scheduler()

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

            const { responseBody } = await this.scheduler.fetch(`https://www.threatcrowd.org/searchApi/v2/domain/report/?${query}`, this.headers)

            const { subdomains: domains = [], emails = [] } = JSON.parse(responseBody.toString())

            const results = []

            domains.forEach((domain) => {
                domain = domain.trim().toLocaleLowerCase()

                if (!domain) {
                    return
                }

                results.push({ id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] })
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

const threatcrowdIpReport = class extends Transformer {
    static get alias() {
        return ['threatcrowd_ip_report', 'tcir']
    }

    static get title() {
        return 'Threatcrowd IP Report'
    }

    static get description() {
        return 'Obtain threatcrowd ip report which helps enumerating virtual hosts.'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    constructor() {
        super()

        this.scheduler = new Scheduler()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const query = querystring.stringify({
                ip: label
            })

            const { responseBody } = await this.scheduler.fetch(`https://www.threatcrowd.org/searchApi/v2/ip/report/?${query}`, this.headers)

            const { resolutions = [] } = JSON.parse(responseBody.toString())

            const results = []

            resolutions.forEach(({ domain }) => {
                domain = domain.trim().toLocaleLowerCase()

                if (!domain) {
                    return
                }

                results.push({ id: domain, type: 'domain', label: domain, props: { domain }, edges: [target] })
            })

            return results
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { threatcrowdDomainReport, threatcrowdIpReport }
