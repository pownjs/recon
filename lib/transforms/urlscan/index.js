const querystring = require('querystring')

const { Transformer } = require('../../transformer')

const urlscanLiveshot = class extends Transformer {
    static get alias() {
        return ['usls']
    }

    static get title() {
        return 'Urlscan Liveshot'
    }

    static get description() {
        return 'Generates a liveshot of any public site via urlscan.'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const uri = label

        const query = querystring.stringify({
            width: 1024,
            height: 768,
            url: uri
        })

        const image = `https://urlscan.io/liveshot/?${query}`

        return [
            { id: uri, type: 'image', label: uri, image, props: { image, uri }, edges: [target] }
        ]
    }
}

module.exports = { urlscanLiveshot }
