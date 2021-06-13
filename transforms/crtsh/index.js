const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { normalizeDomain } = require('../../lib//normalize')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../lib//types')

const crtshCNDomainReport = class extends Transform {
    static get alias() {
        return ['crtsh_cn_domain_report', 'crtshcdr']
    }

    static get title() {
        return 'CRT.SH CN Domain Report'
    }

    static get description() {
        return 'Obtain crt.sh domain report which helps enumerating potential target subdomains'
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
            CN: `%.${label}`
        })

        const { responseBody } = await this.scheduler.tryRequest({ uri: `https://crt.sh/?${query}` })

        const text = responseBody.toString()
        const expr = new RegExp(/<TD>(?:\*\.)?([^\s]+?)\.?<\/TD>/g)

        const domains = []

        let match = expr.exec(text)

        while (match) {
            match[1].split(/<br>/gi).forEach((line) => {
                domains.push(line.toLowerCase().replace(/^\.+|\.+$/g, '').trim())
            })

            match = expr.exec(text)
        }

        const results = []

        Array.from(new Set(domains)).forEach((domain) => {
            domain = normalizeDomain(domain)

            if (!domain) {
                return
            }

            if (!domain.endsWith(`.${label}`)) {
                return
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] })
        })

        return results
    }
}

const crtshSANDomainReport = class extends Transform {
    static get alias() {
        return ['crtsh_san_domain_report', 'crtshsdr']
    }

    static get title() {
        return 'CRT.SH SAN Domain Report'
    }

    static get description() {
        return 'Obtain crt.sh domain report which helps enumerating potential target subdomains'
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
            dNSName: `%.${label}`
        })

        const { responseBody } = await this.scheduler.tryRequest({ uri: `https://crt.sh/?${query}` })

        const text = responseBody.toString()
        const expr = new RegExp(/<TD>(?:\*\.)?([^\s]+?)\.?<\/TD>/g)

        const domains = []

        let match = expr.exec(text)

        while (match) {
            match[1].split(/<br>/gi).forEach((line) => {
                domains.push(line.toLowerCase().replace(/^\.+|\.+$/g, '').trim())
            })

            match = expr.exec(text)
        }

        const results = []

        Array.from(new Set(domains)).forEach((domain) => {
            domain = normalizeDomain(domain)

            if (!domain) {
                return
            }

            if (!domain.endsWith(`.${label}`)) {
                return
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] })
        })

        return results
    }
}

module.exports = { crtshCNDomainReport, crtshSANDomainReport }
