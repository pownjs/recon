const { EventEmitter } = require('events')

// WARNING: The API for Scout is pretty much unstable and very early stage.

class Scout extends EventEmitter {
    constructor() {
        super()

        this.nodes = []
        this.transformers = {}
    }

    registerTransforms(transforms) {
        Object.entries(transforms).forEach(([name, value]) => {
            this.transformers[name.toLowerCase()] = value
        })
    }

    registerModuleTransforms(path) {
        const module = require(path)

        this.registerTransforms(module)
    }

    addStringNode(string) {
        this.nodes.push({ id: Math.random().toString(32).slice(2), label: string })
    }

    async transform(transformation, options = {}) {
        transformation = transformation.toLowerCase()

        const transformer = new this.transformers[transformation]()

        if (!transformer) {
            throw new Error(`Unknown transformation ${transformation}`)
        }

        return transformer.run(this.nodes, options)
    }
}

module.exports = { Scout }
