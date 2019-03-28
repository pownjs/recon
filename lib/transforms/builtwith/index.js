const querystring = require('querystring')

const { Scraper } = require('../../scraper')
const { DOMAIN_TYPE, SUBDOMAIN_TYPE } = require('../../types')

const BUILTWTH_TRACKER_TYPE = 'builtwith:tracker'

const builtwithScrapeRelationships = class extends Scraper {
    static get alias() {
        return ['builtwith_scrape_relationships', 'bwsr']
    }

    static get title() {
        return 'Scrape Builtwith Relationships'
    }

    static get description() {
        return 'Performs scrape of builtwith.com relationships.'
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

    static get noise() {
        return 5
    }

    async handle({ id: source = '', type = '', label = '' }, options) {
        const search = querystring.escape(label)

        const uri = `https://builtwith.com/relationships/${search}`

        this.warn(`Fetching relationships from ${uri}`)

        /* global puppeteer */

        const { log } = await this.scrapeWithPuppeteerFunction(this.serializeScrapeFunction(async() => {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()

            await page.goto(uri)

            const data = await page.evaluate(() => {
                const results = {
                    domains: [],
                    trackers: {}
                }

                const cardNode = Array.from(document.querySelectorAll('.card-body')).filter(node => /Connected Websites/.test(node.textContent))[0]

                if (cardNode) {
                    results.domains = Array.from(cardNode.querySelectorAll('tr[id]')).map(n => n.textContent.trim())
                }

                Array.from(document.querySelectorAll('.tbomb')).map((node) => {
                    const tracker = (node.querySelector('a') || {}).textContent || ''
                    const image = (node.querySelector('img') || {}).src || ''

                    const domains = (node.getAttribute('domains') || '')
                        .split('|')
                        .map((link) => {
                            return results.domains.find(d => d.replace(/\./g, '-').replace(/-+/, '-'))
                        })

                    results.trackers[tracker] = { image, domains }
                })

                return JSON.stringify(results)
            })

            console.log(data)

            await browser.close()
        }).replace(/^/, `const uri = ${JSON.stringify(uri)}`))

        const { domains = [], trackers = {} } = JSON.parse(log)

        const results = []

        let subSource

        if (type === DOMAIN_TYPE) {
            subSource = source
        }
        else {
            subSource = this.makeId(DOMAIN_TYPE, label)

            results.push({ id: subSource, type: DOMAIN_TYPE, label: label, props: { domain: label }, edges: [source] })
        }

        domains.forEach((domain) => {
            let edge = subSource

            if (domain.endsWith(`.${label}`)) {
                edge = { type: SUBDOMAIN_TYPE, source: subSource }
            }

            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [edge] })
        })

        Object.entries(trackers).forEach(([tracker, { image, domains }]) => {
            results.push({ type: BUILTWTH_TRACKER_TYPE, label: tracker, image, props: { tracker, domains }, edges: [subSource, ...domains.map(d => this.makeId('domain', d))] })
        })

        return results
    }
}

module.exports = { builtwithScrapeRelationships }
