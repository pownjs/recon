const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { WHOIS_TYPE, IPV4_TYPE } = require('../../types')

const ipinfoio = class extends Transform {
    static get alias() {
        return ['ipinfo_io', 'iiio']
    }

    static get title() {
        return 'ipinfo.io'
    }

    static get description() {
        return 'Obtain ipinfo.io whois report.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [IPV4_TYPE]
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

        this.scheduler = new Scheduler()

        this.headers = {
            'user-agent': 'curl/7.64.1'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const search = querystring.escape(label)
        const query = querystring.stringify({})

        const { responseBody } = await this.scheduler.tryFetch(`https://ipinfo.io/${search}?${query}`, this.headers)

        const { org, ...rest } = JSON.parse(responseBody.toString())

        return [{
            type: WHOIS_TYPE,
            label: org,
            props: { org, ...rest }
        }]
    }
}

module.exports = { ipinfoio }
