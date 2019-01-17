const { EventEmitter } = require('events')

class Scout extends EventEmitter {
    constructor() {
        super()

        this.transformers = {}
    }

    registerModule(path) {
        const module = require(path)

        Object.entries(module).forEach(([name, value]) => {
            this.transformers[name.toLowerCase()] = value
        })
    }

    async transform(nodes, transformation) {
        transformation = transformation.toLowerCase()

        const transformer = new this.transformers[transformation]()

        if (!transformer) {
            throw new Error(`Unknown transformation ${transformation}`)
        }

        return transformer.run(nodes, {})
    }
}

module.exports = { Scout }
