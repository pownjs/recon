const { Transformer } = require('../../transformer')

const { Scheduler } = require('@pown/request/lib/scheduler')

const scheduler = new Scheduler()

const bakeImages = class extends Transformer {
    static get alias() {
        return ['bake_images', 'be']
    }

    static get title() {
        return 'Bake Images'
    }

    static get description() {
        return 'Convert external image into data URIs for self-embedding purposes.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['image', 'screenshot', 'gravatar']
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1000
    }

    async handle(item) {
        const { image } = item

        if (!image) {
            return
        }

        if (!/^https?:\/\//.test(image)) {
            return
        }

        const { responseBody } = await scheduler.fetch(image)

        if (!responseBody) {
            return
        }

        return { ...item, image: `data:text/plain;base64,${responseBody.toString('base64')}` }
    }
}

module.exports = { bakeImages }
