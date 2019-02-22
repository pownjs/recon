const querystring = require('querystring')

const { Scraper } = require('../../scraper')

const { DOMAIN_TYPE } = require('../../types')

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
        return []
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

    async handle({ id: target = '', type = '', label = '' }, options) {
        const search = querystring.escape(label)

        const uri = `https://builtwith.com/relationships/${search}`

        let puppeteer // NOTE: global reference when serialising function code

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

        let subTarget

        if (type === DOMAIN_TYPE) {
            subTarget = target
        }
        else {
            subTarget = this.makeId(DOMAIN_TYPE, label)

            results.push({ id: subTarget, type: DOMAIN_TYPE, label: label, props: { domain: label }, edges: [target] })
        }

        domains.forEach((domain) => {
            results.push({ type: DOMAIN_TYPE, label: domain, props: { domain }, edges: [subTarget] })
        })

        Object.entries(trackers).forEach(([tracker, { image, domains }]) => {
            results.push({ type: BUILTWTH_TRACKER_TYPE, label: tracker, image, props: { tracker, domains }, edges: [subTarget, ...domains.map(d => this.makeId('domain', d))] })
        })

        return results
    }
}

module.exports = { builtwithScrapeRelationships }
