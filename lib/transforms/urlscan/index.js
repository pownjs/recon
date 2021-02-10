const querystring = require('querystring')

const { isUrl } = require('../../detect')
const { Transform } = require('../../transform')
const { normalizeDomain } = require('../../normalize')
const { URI_TYPE, BRAND_TYPE, SCREENSHOT_TYPE, DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const urlscanLiveshot = class extends Transform {
    static get alias() {
        return ['urlscan_liveshot', 'usls']
    }

    static get title() {
        return 'Urlscan Liveshot'
    }

    static get description() {
        return 'Generates a liveshot of any public site via urlscan.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [URI_TYPE]
    }

    static get options() {
        return {
            mix: {
                description: 'Mix input nodes with result nodes',
                type: 'boolean',
                default: true
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '', props = {} }, { mix = true }) {
        const uri = isUrl(label) ? label : isUrl(props.url) ? props.url : isUrl(props.uri) ? props.uri : ''

        if (!uri) {
            throw new Error(`Cannot find url/uri`)
        }

        const query = querystring.stringify({
            width: 1024,
            height: 768,
            url: uri
        })

        const urlscanUri = `https://urlscan.io/liveshot/?${query}`

        if (mix) {
            return [
                { id: source, screenshot: urlscanUri, props: { screenshot: urlscanUri } }
            ]
        }
        else {
            return [
                { type: SCREENSHOT_TYPE, label: uri, screenshot: urlscanUri, props: { screenshot: urlscanUri, uri }, edges: [source] }
            ]
        }
    }
}

const urlscanLiveshotSearchEngines = class extends Transform {
    static get alias() {
        return ['urlscan_liveshot_search_engines', 'uslsse']
    }

    static get title() {
        return 'Urlscan Liveshot Search Engines'
    }

    static get description() {
        return 'Generates a liveshot of a number of search engines.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE]
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
        return ['https://www.shodan.io/search?query=', 'https://censys.io/ipv4?q=', 'https://www.zoomeye.org/searchResult?q=', 'https://buckets.grayhatwarfare.com/results/'].map((prefix) => {
            const uri = `${prefix}${escape(label)}`

            const query = querystring.stringify({
                width: 1024,
                height: 768,
                url: uri
            })

            const image = `https://urlscan.io/liveshot/?${query}`

            return { type: SCREENSHOT_TYPE, label: uri, image, props: { image, uri }, edges: [source] }
        })
    }
}

const urlscanSubdomains = class extends Transform {
    static get alias() {
        return ['urlscan_subdomains', 'uss']
    }

    static get title() {
        return 'Urlscan Subdomains'
    }

    static get description() {
        return 'Find subdomains via urlscan.'
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
            urlscanKey: {
                type: 'string',
                description: 'Urlscan API key.'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, { urlscanKey = process.env.URLSCAN_KEY, ...options }) {
        if (!urlscanKey) {
            this.warn(`no spyse api key specified`)
        }

        const headers = {}

        if (urlscanKey) {
            headers['API-Key'] = urlscanKey
        }

        let domains = []

        let count = 0

        while (true) {
            const query = querystring.stringify({
                q: `domain:${label}`,

                size: 100,

                offset: count
            })

            this.info(`retrieving urlscan page with offset ${count}`)

            const { responseBody } = await this.scheduler.tryRequest({ uri: `https://urlscan.io/api/v1/search/?${query}`, headers: headers })

            const { results, total } = JSON.parse(responseBody.toString())

            this.info(`total results in this query is ${total}`)

            if (!results || !results.length) {
                break
            }

            results.forEach((result) => {
                const { task, page } = result || {}

                const { url } = task || {}
                const { domain } = page || {}

                const domainMatch = url.match(/^https?:\/\/([^\/]+)/)

                if (domainMatch) {
                    const domain = domainMatch[1]

                    if (domain.endsWith(`.${label}`)) {
                        domains.push(domain.trim().toLowerCase())
                    }
                }

                if (domain) {
                    if (domain.endsWith(`.${label}`)) {
                        domains.push(domain.trim().toLowerCase())
                    }
                }
            })

            count += results.length

            if (count >= total) {
                break
            }
        }

        const nodes = []

        domains = Array.from(new Set(domains))

        domains.forEach((domain) => {
            domain = normalizeDomain(domain)

            nodes.push({
                type: DOMAIN_TYPE,
                label: domain,
                props: {
                    domain: domain
                },
                edges: [{ source, type: SUBDOMAIN_TYPE }]
            })
        })

        return nodes
    }
}

module.exports = { urlscanLiveshot, urlscanLiveshotSearchEngines, urlscanSubdomains }
