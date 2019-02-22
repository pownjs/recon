const querystring = require('querystring')

const { Scraper } = require('../../scraper')

const ZOOMEYE_SEARCH_ITEM_TYPE = 'zoomeye:search:item'

const zoomeyeScrapeSearchResults = class extends Scraper {
    static get alias() {
        return ['zoomeye_scrape_search_results', 'zyssr']
    }

    static get title() {
        return 'Scrape ZoomEye Search Results'
    }

    static get description() {
        return 'Performs first page scrape on ZoomEye search results'
    }

    static get tags() {
        return []
    }

    static get types() {
        return ['domain', 'ipv4', 'ipv6']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            q: label
        })

        const uri = `https://www.zoomeye.org/searchResult?${query}`

        let puppeteer

        const { log } = await this.scrapeWithPuppeteerFunction(this.serializeScrapeFunction(async() => {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()

            await page.goto(uri)

            const data = await page.evaluate(() => {
                return JSON.stringify(Array.from(document.querySelectorAll('.search-result-item')).map((item) => {
                    return {
                        title: (item.querySelector('.search-result-item-title') || {}).textContent,
                        uri: (item.querySelector('.search-result-item-title[rel]') || {}).href,
                        tags: Array.from(item.querySelectorAll('.search-result-tags button')).map(item => item.textContent),
                        code: item.querySelector('pre').textContent
                    }
                }))
            })

            console.log(data)

            await browser.close()
        }).replace(/^/, `const uri = ${JSON.stringify(uri)}`))

        const items = JSON.parse(log)

        return items.map(({ title, uri, tags }) => {
            return { type: ZOOMEYE_SEARCH_ITEM_TYPE, label: title, props: { title, uri, tags }, edges: [target] }
        })
    }
}

module.exports = { zoomeyeScrapeSearchResults }
