const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE, EMAIL_TYPE, IPV4_TYPE, IPV6_TYPE } = require('../../lib//types')

const threatcrowdDomainReport = class extends Transform {
    static get alias() {
        return ['threatcrowd_domain_report', 'tcdr']
    }

    static get title() {
        return 'Threatcrowd Domain Report'
    }

    static get description() {
        return 'Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses'
    }

    static get types() {
        return [DOMAIN_TYPE]
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
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
            domain: label
        })

        const { subdomains: domains = [], emails = [] } = await this.scheduler.tryRequest({ uri: `https://www.threatcrowd.org/searchApi/v2/domain/report/?${query}`, toJson: true })

        const results = []

        domains.forEach((domain) => {
            domain = normalizeDomain(domain)

            if (!domain) {
                return
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] })
        })

        emails.forEach((email) => {
            email = email.trim().toLocaleLowerCase()

            if (!email) {
                return
            }

            results.push({ type: EMAIL_TYPE, label: email, props: { email }, edges: [source] })
        })

        return results
    }
}

const threatcrowdIpReport = class extends Transform {
    static get alias() {
        return ['threatcrowd_ip_report', 'tcir']
    }

    static get title() {
        return 'Threatcrowd IP Report'
    }

    static get description() {
        return 'Obtain threatcrowd ip report which helps enumerating virtual hosts'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {}
    }

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            ip: label
        })

        const { resolutions = [] } = await this.scheduler.tryRequest({ uri: `https://www.threatcrowd.org/searchApi/v2/ip/report/?${query}`, toJson: true })

        const results = []

        resolutions.forEach(({ domain }) => {
            domain = normalizeDomain(domain)

            if (!domain) {
                return
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [source] })
        })

        return results
    }
}

module.exports = { threatcrowdDomainReport, threatcrowdIpReport }
