const querystring = require('querystring')

const { Scraper } = require('../../scraper')

const builtwithScrapeRelationships = class extends Scraper {
    static get alias() {
        return ['builtwith_scrape_relationships', 'bwsr']
    }

    static get title() {
        return 'Scrape Builtwith Relationships'
    }

    static get description() {
        return 'Performs scrape of builtwith relationships'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    async run(items, options) {
        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const search = querystring.escape(label)

            const uri = `https://builtwith.com/relationships/${search}`

            let puppeteer

            const { log } = await this.scrapeWithPuppeteerFunction(this.serializeScrapeFunction(async() => {
                const browser = await puppeteer.launch()
                const page = await browser.newPage()

                await page.goto(uri)

                const data = await page.evaluate(() => {
                    const results = {
                        uris: []
                    }

                    const targetNode = Array.from(document.querySelectorAll('.card-body')).filter(node => /Connected Websites/.test(node.textContent))[0]

                    if (targetNode) {
                        results.uris = Array.from(targetNode.querySelectorAll('tr[id]')).map(n => n.textContent.trim())
                    }

                    return JSON.stringify(results)
                })

                console.log(data)

                await browser.close()
            }).replace(/^/, `const uri = ${JSON.stringify(uri)}`))

            const { uris = [] } = JSON.parse(log)

            return uris.map((uri) => {
                return { id: uri, type: 'uri', label: uri, props: { uri }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { builtwithScrapeRelationships }
