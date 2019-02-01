const cytoscape = require('cytoscape')
const { EventEmitter } = require('events')

const { makeId } = require('./utils')

class Scout extends EventEmitter {
    constructor() {
        super()

        this.cy = cytoscape({
            headless: true
        })

        this.transformers = {}

        this.selection = this.cy.collection()
    }

    serialize() {
        return this.cy.json()
    }

    deserialize(input) {
        this.cy.json(input)
    }

    registerTransforms(transforms) {
        Object.entries(transforms).forEach(([name, transform]) => {
            this.transformers[name.toLowerCase()] = transform
        })
    }

    addNodes(nodes) {
        let collection = this.cy.collection()

        nodes.forEach(({ edges = [], ...data }) => {
            try {
                const node = this.cy.add({
                    group: 'nodes',
                    data: data
                })

                collection = collection.add(node)
            }
            catch (e) {
                this.emit('error', e)

                return
            }

            edges.forEach((target) => {
                const source = data.id

                try {
                    const edge = this.cy.add({
                        group: 'edges',
                        data: {
                            id: `edge:${source}:${target}`,
                            source: source,
                            target: target
                        }
                    })

                    collection = collection.add(edge)
                }
                catch (e) {
                    this.emit('error', e)

                    return
                }
            })
        })

        return this.selection = collection.nodes()
    }

    select(...expressions) {
        return this.selection = this.cy.nodes(expressions.join(','))
    }

    group(group) {
        const parentId = makeId()

        this.cy.add({
            data: {
                id: parentId,
                label: group
            }
        })

        this.selection.move({ parent: parentId })
    }

    ungroup() {
        this.selection.move({ parent: null })
    }

    async transform(transformation, options = {}, property) {
        transformation = transformation.toLowerCase()

        const transformer = new this.transformers[transformation]()

        transformer.on('info', this.emit.bind(this, 'info'))
        transformer.on('warn', this.emit.bind(this, 'warn'))
        transformer.on('error', this.emit.bind(this, 'error'))

        if (!transformer) {
            throw new Error(`Unknown transformation ${transformation}`)
        }

        let nodes = this.selection.map((node) => {
            return node.data()
        })

        if (property) {
            // NOTE: it may require better design

            nodes = nodes.map(({ props, ...rest }) => ({ ...rest, label: props[property] || '', props }))
        }

        const results = await transformer.run(nodes, options)

        this.addNodes(results)

        return results
    }
}

module.exports = { Scout }
