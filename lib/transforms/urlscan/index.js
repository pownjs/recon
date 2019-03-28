const querystring = require('querystring')

const { Transformer } = require('../../transformer')
const { URI_TYPE, BRAND_TYPE, SCREENSHOT_TYPE } = require('../../types')

const urlscanLiveshot = class extends Transformer {
    static get alias() {
        return ['urlscan_liveshot', 'usls']
    }

    static get title() {
        return 'Urlscan Liveshot'
    }

    static get description() {
        return 'Generates a liveshot of any public site via urlscan.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [URI_TYPE]
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const uri = label

        const query = querystring.stringify({
            width: 1024,
            height: 768,
            url: uri
        })

        const image = `https://urlscan.io/liveshot/?${query}`

        return [
            { type: SCREENSHOT_TYPE, label: uri, image, props: { image, uri }, edges: [source] }
        ]
    }
}

const urlscanLiveshotSearchEngines = class extends Transformer {
    static get alias() {
        return ['urlscan_liveshot_search_engines', 'uslsse']
    }

    static get title() {
        return 'Urlscan Liveshot Search Engines'
    }

    static get description() {
        return 'Generates a liveshot of a number of search engines.'
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

            return { type: 'screenshot', label: uri, image, props: { image, uri }, edges: [source] }
        })
    }
}

module.exports = { urlscanLiveshot, urlscanLiveshotSearchEngines }
