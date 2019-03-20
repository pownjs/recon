const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transformer } = require('../../transformer')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const scheduler = new Scheduler()

const crtshDomainReport = class extends Transformer {
    static get alias() {
        return ['crtsh_domain_report', 'crtshdr']
    }

    static get title() {
        return 'CRT.SH Domain Report'
    }

    static get description() {
        return 'Obtain crt.sh domain report which helps enumerating potential target subdomains.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return [DOMAIN_TYPE]
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
            dNSName: `%.${label}`
        })

        const { responseBody } = await scheduler.fetch(`https://crt.sh/?${query}`, this.headers)

        const text = responseBody.toString()
        const expr = new RegExp(/<TD>(?:\*\.)?([^\s]+?)\.?<\/TD>/g)

        const domains = []

        let match = expr.exec(text)

        while (match) {
            domains.push(match[1].toLowerCase().replace(/^\.+|\.+$/g, '').trim())

            match = expr.exec(text)
        }

        const results = []

        Array.from(new Set(domains)).forEach((domain) => {
            domain = domain.trim().toLocaleLowerCase()

            if (!domain) {
                return
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [{ target, type: SUBDOMAIN_TYPE }] })
        })

        return results
    }
}

module.exports = { crtshDomainReport }
