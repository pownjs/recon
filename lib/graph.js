const assert = require('assert')
const process = require('process')
const { EventEmitter } = require('events')
const { isIterable, isAsyncIterable } = require('@pown/async/lib/utils')

const { makeId } = require('./utils')
const { cytoscape } = require('./cytoscape')

class Graph extends EventEmitter {
    constructor(options) {
        super()

        const { maxNodesWarn = 0, maxNodesCap = 0, optionsInstance, ...settings } = options || {}

        this.maxNodesWarn = maxNodesWarn
        this.maxNodesCap = maxNodesCap
        this.optionsInstance = optionsInstance

        this.reset(settings)
    }

    reset(options) {
        const { cy, ...settings } = options

        if (cy) {
            this.cy = cy
        }
        else {
            this.cy = cytoscape({ ...settings, headless: true })
        }

        this.selection = this.cy.collection()
    }

    elements() {
        if (this.selection && this.selection.length) {
            return this.selection.elements()
        }
        else {
            return this.cy.elements()
        }
    }

    serialize() {
        return this.cy.json()
    }

    deserialize(input) {
        this.cy.json(input)
    }

    add(nodes) {
        // NOTE: This function supports both sync and async access under the same roof. If the function is
        // invoked with any Iterable the result will be sync, otherwise the result is async promise. This
        // is done in order to prevent common errors.

        if (!isIterable(nodes)) {
            nodes = [nodes]
        }

        let updateProgres
        let endProgress

        if (nodes.length) {
            let index = 0

            this.emit('barStart', 'adding nodes', { total: nodes.length })

            updateProgres = (c = 0) => this.emit('barStep', 'adding nodes', { step: (index += c) })
            endProgress = () => this.emit('barEnd', 'adding nodes')
        }
        else {
            updateProgres = () => {}
            endProgress = () => {}
        }

        let collection = this.cy.collection()

        const handleNode = ({ id, type, label, props, edges = [], ...data }) => {
            updateProgres()

            if (!id) {
                id = makeId(type, label)
            }

            let node = this.cy.getElementById(id)

            if (node.length) {
                let nodeData = node.data()

                try {
                    if (type) {
                        nodeData.type = type
                    }

                    if (label) {
                        nodeData.label = label
                    }

                    if (props) {
                        nodeData.props = { ...nodeData.props, ...props }
                    }

                    node.data({ ...nodeData, ...data })
                }
                catch (e) {
                    this.emit('error', e)

                    return
                }
            }
            else {
                if (process.env.NODE_ENV !== 'production') {
                    assert.ok(type, `Node type is not specified`)
                }

                try {
                    node = this.cy.add({
                        group: 'nodes',
                        data: {
                            ...data,

                            id,
                            type,
                            label,
                            props
                        }
                    })
                }
                catch (e) {
                    this.emit('internal-error', e)

                    return
                }
            }

            try {
                collection = collection.add(node)
            }
            catch (e) {
                this.emit('internal-error', e)

                return
            }

            edges.forEach((edge) => {
                let source
                let type
                let data

                if (typeof(edge) === 'string') {
                    source = edge
                    type = ''
                    data = {}
                }
                else {
                    source = edge.source || ''
                    type = edge.type || ''
                    data = edge
                }

                const target = id

                try {
                    const edgeElement = this.cy.add({
                        group: 'edges',
                        data: {
                            id: `edge:${type}:${source}:${target}`,
                            source: source,
                            target: target,

                            ...data
                        }
                    })

                    collection = collection.add(edgeElement)
                }
                catch (e) {
                    this.emit('internal-error', e)

                    return
                }
            })

            updateProgres(1)
        }

        if (isAsyncIterable(nodes)) {
            return new Promise(async(resolve) => {
                this.cy.startBatch()

                for await (let node of nodes) {
                    handleNode(node)
                }

                this.cy.endBatch()

                endProgress()

                resolve(this.selection = collection.nodes())
            })
        }
        else {
            this.cy.startBatch()

            for (let node of nodes) {
                handleNode(node)
            }

            this.cy.endBatch()

            endProgress()

            return this.selection = collection.nodes()
        }
    }

    remove(nodes) {
        // NOTE: This function supports both sync and async access under the same roof. If the function is
        // invoked with any Iterable the result will be sync, otherwise the result is async promise. This
        // is done in order to prevent common errors.

        if (!isIterable(nodes)) {
            nodes = [nodes]
        }

        let updateProgres
        let endProgress

        if (nodes.length) {
            let index = 0

            this.emit('barStart', 'removing nodes', { total: nodes.length })

            updateProgres = (c = 0) => this.emit('barStep', 'removing nodes', { step: (index += c) })
            endProgress = () => this.emit('barEnd', 'removing nodes')
        }
        else {
            updateProgres = () => {}
            endProgress = () => {}
        }

        const handleNode = (node) => {
            updateProgres()

            this.cy.getElementById(typeof(node) === 'string' ? node : node.id).remove()

            updateProgres(1)
        }

        if (isAsyncIterable(nodes)) {
            return new Promise(async(resolve) => {
                this.cy.startBatch()

                for await (let node of nodes) {
                    handleNode(node)
                }

                this.cy.endBatch()

                endProgress()

                resolve(this.selection = this.cy.collection())
            })
        }
        else {
            this.cy.startBatch()

            for (let node of nodes) {
                handleNode(node)
            }

            this.cy.endBatch()

            endProgress()

            return this.selection = this.cy.collection()
        }
    }

    select(...expressions) {
        return this.selection = this.cy.nodes(expressions.join(','))
    }

    unselect() {
        return this.selection = this.cy.collection()
    }

    traverse(...expressions) {
        return this.selection = this.cy.traverse(expressions.join('|'))
    }

    untraverse() {
        return this.selection = this.cy.collection()
    }

    group(label, selection = this.selection) {
        const parentId = makeId('group', label)

        try {
            this.cy.add({
                data: {
                    id: parentId,
                    type: 'group',
                    label: label,
                    props: {}
                }
            })
        }
        catch (e) {
            this.emit('error', e)
        }

        const parents = selection.parent()

        selection.move({ parent: parentId })

        parents.forEach((parent) => {
            if (parent.isChildless()) {
                parent.remove()
            }
        })
    }

    ungroup(selection = this.selection) {
        const parents = selection.parent()

        selection.move({ parent: null })

        parents.forEach((parent) => {
            if (parent.isChildless()) {
                parent.remove()
            }
        })
    }

    measure(selection = this.selection) {
        selection.nodes().forEach((node) => {
            node.data('weight', node.connectedEdges().length)
        })
    }

    unmeasure(selection = this.selection) {
        selection.nodes().forEach((node) => {
            node.data('weight', 0)
        })
    }

    // NOTE: legacy methods

    addNodes(...props) {
        return this.add(...props)
    }

    removeNodes(...props) {
        return this.remove(...props)
    }
}

module.exports = { Graph }
