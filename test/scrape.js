const assert = require('assert')

const { scrapeWithPuppeteer } = require('../lib/transforms/utils/scrape')

describe('scrape', () => {
    describe('#scrapeWithPuppeteer', () => {
        it('scrapes google search', async function() {
            this.timeout(10000)

            const { log, screenshot } = await scrapeWithPuppeteer(async() => {
                const browser = await puppeteer.launch()
                const page = await browser.newPage()

                await page.goto('https://www.google.com/search?q=test')

                const links = await page.evaluate(() => {
                    const anchors = document.querySelectorAll('a')

                    return Array.from(anchors).map((anchor) => {
                        return anchor.href
                    })
                })

                console.log(JSON.stringify(links))

                await page.screenshot({ path: 'screenshot0.png' })

                await browser.close()
            })

            assert.ok(log.length > 0, 'there is log')
            assert.ok(screenshot.length > 0, 'there is a screenshot')
        })
    })
})
