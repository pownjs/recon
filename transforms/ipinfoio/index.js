const querystring = require('querystring')

const { Transform } = require('../../lib//transform')
const { WHOIS_TYPE, IPV4_TYPE } = require('../../lib//types')

const ipinfoioWidgetSearch = class extends Transform {
    static get alias() {
        return ['ipinfoio_widget_search', 'iiiows']
    }

    static get title() {
        return 'ipinfo.io widget search'
    }

    static get description() {
        return 'Obtain ipinfo.io whois report via the web widget'
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

    async handle({ id: source = '', label = '' }, options) {
        const search = querystring.escape(label)

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
            'Referer': 'https://ipinfo.io/'
        }

        const { org, ...rest } = await this.scheduler.tryRequest({ uri: `https://ipinfo.io/widget/${search}`, headers, toJson: true })

        return [{
            type: WHOIS_TYPE,
            label: org,
            props: { org, ...rest }
        }]
    }
}

module.exports = { ipinfoioWidgetSearch }
