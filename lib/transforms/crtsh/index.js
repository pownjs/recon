const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const scheduler = new Scheduler()

const crtshCNDomainReport = class extends Transform {
    static get alias() {
        return ['crtsh_cn_domain_report', 'crtshcdr']
    }

    static get title() {
        return 'CRT.SH CN Domain Report'
    }

    static get description() {
        return 'Obtain crt.sh domain report which helps enumerating potential target subdomains.'
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

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            CN: `%.${label}`
        })

        const { responseBody } = await scheduler.tryFetch(`https://crt.sh/?${query}`, this.headers)

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
            domain = domain.trim().toLocaleLowerCase()

            if (!domain) {
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
        return 'Obtain crt.sh domain report which helps enumerating potential target subdomains.'
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

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            dNSName: `%.${label}`
        })

        const { responseBody } = await scheduler.tryFetch(`https://crt.sh/?${query}`, this.headers)

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
            domain = domain.trim().toLocaleLowerCase()

            if (!domain) {
                return
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ source, type: SUBDOMAIN_TYPE }] })
        })

        return results
    }
}

module.exports = { crtshCNDomainReport, crtshSANDomainReport }
