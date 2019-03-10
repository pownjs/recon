const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')
const { IPV4_TYPE, IPV6_TYPE } = require('../../types')

const scheduler = new Scheduler()

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
        return []
    }

    static get tags() {
        return []
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            domain: label
        })

        const { responseBody } = await scheduler.fetch(`https://www.threatcrowd.org/searchApi/v2/domain/report/?${query}`, this.headers)

        const { subdomains: domains = [], emails = [] } = JSON.parse(responseBody.toString())

        const results = []

        domains.forEach((domain) => {
            domain = domain.trim().toLocaleLowerCase()

            if (!domain) {
                return
            }

            results.push({ type: 'domain', label: domain, props: { domain }, edges: [target] })
        })

        emails.forEach((email) => {
            email = email.trim().toLocaleLowerCase()

            if (!email) {
                return
            }

            results.push({ type: 'email', label: email, props: { email }, edges: [target] })
        })

        return results
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

    static get tags() {
        return []
    }

    static get types() {
        return [IPV4_TYPE, IPV6_TYPE]
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

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            ip: label
        })

        const { responseBody } = await scheduler.fetch(`https://www.threatcrowd.org/searchApi/v2/ip/report/?${query}`, this.headers)

        const { resolutions = [] } = JSON.parse(responseBody.toString())

        const results = []

        resolutions.forEach(({ domain }) => {
            domain = domain.trim()

            if (!domain) {
                return
            }

            domain = domain.toLowerCase()

            domain = domain.replace(/\*/, '')
            domain = domain.replace(/^\./, '')
            domain = domain.replace(/\.+/, '.')

            results.push({ type: 'domain', label: domain, props: { domain }, edges: [target] })
        })

        return results
    }
}

module.exports = { threatcrowdDomainReport, threatcrowdIpReport }
