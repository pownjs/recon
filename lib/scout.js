const cytoscape = require('cytoscape')
const { EventEmitter } = require('events')

const { makeId } = require('./utils')
const { urlRegex, emailRegex } = require('./regex')

class Scout extends EventEmitter {
    constructor(options = {}) {
        super()

        const { cy, ...settings } = options

        if (cy) {
            this.cy = cy
        }
        else {
            this.cy = cytoscape({
                ...settings,

                headless: true
            })
        }

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

        // TODO: cleanup the parent if no longer required
    }

    async transform(transformation, options = {}, subtransform = {}) {
        let transformerNames

        if (transformation === '*') {
            transformerNames = Object.keys(this.transformers)
        }
        else {
            transformerNames = [transformation.toLowerCase()]
        }

        let transformers = transformerNames.map((transformerName) => {
            if (!this.transformers.hasOwnProperty(transformerName)) {
                throw new Error(`Unknown transformer ${transformerName}`)
            }

            const transformer = new this.transformers[transformerName]()

            transformer.on('info', this.emit.bind(this, 'info'))
            transformer.on('warn', this.emit.bind(this, 'warn'))
            transformer.on('error', this.emit.bind(this, 'error'))

            return transformer
        })

        let nodes = this.selection.map((node) => {
            return node.data()
        })

        if (transformation === '*') {
            const nodeTypes = [].concat(...Array.from(new Set(nodes.map(({ type, label }) => {
                const types = []

                if (type) {
                    types.push(type)
                }

                if (label) {
                    if (urlRegex.test(label)) {
                        types.push('uri')
                    }
                    else
                    if (emailRegex.test(label)) {
                        types.push('email')
                    }

                    // TODO: add additional auto types
                }

                return types
            }))))

            transformers = transformers.filter(({ constructor = {} }) => constructor.types.some((type) => nodeTypes.includes(type)))
        }

        const { extract } = subtransform

        if (extract) {
            const { property, prefix = '', suffix = '' } = extract

            if (property) {
                nodes = nodes.map(({ props, ...rest }) => {
                    const label = `${prefix}${props[property] || ''}${suffix}`

                    return { ...rest, props, label }
                })
            }
        }

        let results = await Promise.all(transformers.map((transformer) => {
            return transformer.run(nodes, options)
        }))

        results = [].concat(...results)

        this.addNodes(results)

        return results
    }
}

module.exports = { Scout }
