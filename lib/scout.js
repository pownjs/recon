const cytoscape = require('cytoscape')
const { EventEmitter } = require('events')

// WARNING: The API for Scout is pretty much unstable and very early stage.

class Scout extends EventEmitter {
    constructor() {
        super()

        this.cy = cytoscape({
            headless: true
        })

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

    addNode(node) {
        const { edges = [], ...data } = node

        this.cy.add({
            group: 'nodes',
            data: data
        })

        edges.forEach((target) => {
            const source = data.id

            this.cy.add({
                group: 'edges',
                data: {
                    id: `edge:${source}:${target}`,
                    source: source,
                    target: target
                }
            })
        })
    }

    addStringNode(string) {
        this.addNode({ id: `string:${string}`, type: 'string', label: string, props: { string } })
    }

    save() {
        return this.cy.json()
    }

    load(input) {
        this.cy.json(input)
    }

    async transform(transformation, options = {}) {
        transformation = transformation.toLowerCase()

        const transformer = new this.transformers[transformation]()

        transformer.on('info', this.emit.bind(this, 'info'))
        transformer.on('warn', this.emit.bind(this, 'warn'))
        transformer.on('error', this.emit.bind(this, 'error'))

        if (!transformer) {
            throw new Error(`Unknown transformation ${transformation}`)
        }

        const nodes = this.cy.nodes().map((node) => {
            return node.data()
        })

        const results = await transformer.run(nodes, options)

        results.forEach((node) => {
            this.addNode(node)
        })

        return results
    }
}

module.exports = { Scout }
