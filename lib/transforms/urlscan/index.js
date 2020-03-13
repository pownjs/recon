const querystring = require('querystring')

const { isUrl } = require('../../detect')
const { Transform } = require('../../transform')
const { URI_TYPE, BRAND_TYPE, SCREENSHOT_TYPE } = require('../../types')

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

module.exports = { urlscanLiveshot, urlscanLiveshotSearchEngines }
