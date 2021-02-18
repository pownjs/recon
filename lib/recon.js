const assert = require('assert')
const { EventEmitter } = require('events')
const { setInterval, clearInterval } = require('timers')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { makeId } = require('./utils')
const { cytoscape } = require('./cytoscape')
const { isUrl, isEmail, isIpv4, isIpv6, isDomain } = require('./detect')
const { URL_TYPE, EMAIL_TYPE, IPV4_TYPE, IPV6_TYPE, DOAMIN_TYPE } = require('./types')

class Recon extends EventEmitter {
    constructor(options = {}) {
        super()

        const { cy, maxNodesWarn = 0, maxNodesCap = 0, ...settings } = options

        this.maxNodesWarn = maxNodesWarn
        this.maxNodesCap = maxNodesCap

        this.resetGraph({ cy, ...settings })

        this.transforms = {}
    }

    resetGraph(options) {
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

        this.selection = this.cy.collection()
    }

    registerTransforms(transforms) {
        Object.entries(transforms).forEach(([name, transform]) => {
            this.transforms[name.toLowerCase()] = transform.load ? transform.load() : transform
        })
    }

    serialize() {
        return this.cy.json()
    }

    deserialize(input) {
        this.cy.json(input)
    }

    addNodes(nodes) {
        let collection = this.cy.collection()

        this.cy.startBatch()

        this.emit('barStart', 'Adding nodes', { total: nodes.length })

        nodes.forEach(({ id, type, label, props, edges = [], ...data }, index) => {
            this.emit('barStep', 'Adding nodes', { step: index })

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

            this.emit('barStep', 'Adding nodes', { step: index + 1 })
        })

        this.emit('barEnd', 'Adding nodes')

        this.cy.endBatch()

        return this.selection = collection.nodes()
    }

    removeNodes(nodes) {
        throw new Error(`Not implemented`) // TODO: add code here
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

    getCurrentElements() {
        if (this.selection && this.selection.length) {
            return this.selection.elements()
        }
        else {
            return this.cy.elements()
        }
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

        selection.move({ parent: parentId })
    }

    ungroup(selection = this.selection) {
        selection.move({ parent: null })

        // TODO: cleanup the parent if no longer required
    }

    measure(selection = this.selection) {
        selection
            .nodes()
            .forEach((node) => {
                node.data('weight', node.connectedEdges().length)
            })
    }

    unmeasure(selection = this.selection) {
        selection
            .nodes()
            .forEach((node) => {
                node.data('weight', 0)
            })
    }

    async transform(transformation, options = {}, settings = {}) {
        const { transformConcurrency = Infinity, nodeConcurrency = Infinity, timeout = 0, group = false, weight = false, filter, extract, maxNodesWarn: _maxNodesWarn, maxNodesCap: _maxNodesCap, optionsInstance } = settings

        const maxNodesWarn = _maxNodesWarn || this.maxNodesWarn
        const maxNodesCap = _maxNodesCap || this.maxNodesCap

        let transformNames

        if (transformation === '*') {
            transformNames = Object.keys(this.transforms)
        }
        else {
            transformNames = [transformation.toLowerCase()]
        }

        let transforms = transformNames.map((transformName) => {
            if (!this.transforms.hasOwnProperty(transformName)) {
                throw new Error(`Unknown transform ${transformName}`)
            }

            const transform = new this.transforms[transformName]()

            transform.name = transformName

            const prefix = `transform ${JSON.stringify(transform.constructor.title)} :::`

            transform.on('info', (...args) => {
                this.emit('info', prefix, ...args)
            })

            transform.on('warn', (...args) => {
                this.emit('warn', prefix, ...args)
            })

            transform.on('error', (...args) => {
                this.emit('error', prefix, ...args)
            })

            transform.on('debug', (...args) => {
                this.emit('debug', prefix, ...args)
            })

            return transform
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
                    if (isUrl(label)) {
                        types.push(URL_TYPE)
                    }
                    else
                    if (isEmail(label)) {
                        types.push(EMAIL_TYPE)
                    }
                    else
                    if (isIpv4(label)) {
                        types.push(IPV4_TYPE)
                    }
                    else
                    if (isIpv6(label)) {
                        types.push(IPV6_TYPE)
                    }
                    else
                    if (isDomain(label)) {
                        types.push(DOAMIN_TYPE)
                    }

                    // TODO: add additional auto types
                }

                return types
            }))))

            transforms = transforms.filter(({ constructor = {} }) => constructor.types.some((type) => nodeTypes.includes(type)))

            if (filter) {
                const { noise = 10, name, alias, title, tag } = filter

                transforms = transforms.filter(({ constructor = {} }) => constructor.noise <= noise)

                if (name || alias || title || tag) {
                    transforms = transforms.filter(({ constructor = {} }) => {
                        const a = name && name.test(constructor.name)
                        const b = alias && constructor.alias.some((alias) => alias.test(alias))
                        const c = title && title.test(constructor.title)
                        const d = tag && constructor.tags.some((tag) => tag.test(tag))

                        return a || b || c || d
                    })
                }
            }
        }

        if (extract) {
            const { property, prefix = '', suffix = '' } = extract

            if (property) {
                nodes = nodes
                    .map(({ props, ...rest }) => {
                        let value

                        try {
                            value = property.split('.').reduce((o, i) => o[i], props)
                        }
                        catch (e) {
                            value = ''
                        }

                        if (!value) {
                            return
                        }

                        const label = `${prefix}${value}${suffix}`

                        return { ...rest, props, label }
                    })
                    .filter((node) => node)
            }
        }

        transforms.sort((a, b) => a.constructor.priority - b.constructor.priority)

        let results = []

        await eachOfLimit(transforms, transformConcurrency, async(transform) => {
            const title = transform.constructor.title
            const quotedTitle = JSON.stringify(title)

            let actualNodes

            if (transformation === '*') {
                actualNodes = nodes.filter(({ type }) => transform.constructor.types.includes(type))
            }
            else {
                actualNodes = nodes
            }

            let step = 0
            let steps = 0

            const progressHandler = (s, ss) => {
                step = s
                steps = ss
            }

            transform.on('progress', progressHandler)

            this.emit('info', `starting transform ${quotedTitle} on ${actualNodes.length} nodes...`)

            const interval = setInterval(() => {
                if (step > 0) {
                    this.emit('info', `transform ${quotedTitle} still running ${step}/${steps}...`)
                }
                else {
                    this.emit('info', `transform ${quotedTitle} still running...`)
                }
            }, 10000)

            const transformCategories = !transform.constructor.category ? [] : Array.isArray(transform.constructor.category) ? transform.constructor.category : [transform.constructor.category]
            const transformAliases = !transform.constructor.alias ? [] : Array.isArray(transform.constructor.alias) ? transform.constructor.alias : [transform.constructor.alias]
            const transformNames = [transform.name].concat(transformAliases, transformCategories)

            const actualOptions = {
                ...(
                    optionsInstance ? (
                        Object.assign({}, ...transformNames.map((name) => {
                            return optionsInstance.getOptions(name)
                        }))
                    ) : undefined
                ),

                ...options
            }

            let subResults

            try {
                const tasks = [transform.run(actualNodes, actualOptions, nodeConcurrency)]

                if (timeout > 0) {
                    // TODO: add implementation
                    // NOTE: at the moment this is not possible with promises
                }

                subResults = await Promise.race(tasks)
            }
            catch (e) {
                subResults = []

                this.emit('warn', `transform ${quotedTitle} failed`)
                this.emit('error', `${title}:`, e)
            }

            clearInterval(interval)

            transform.off('progress', progressHandler)

            if (subResults && subResults.length) {
                this.emit('info', `transform ${quotedTitle} finished with ${subResults.length} results`)

                if (group) {
                    const { group, title, description } = transform.constructor

                    const label = group

                    const parentId = makeId('group', label)

                    subResults.forEach((result) => {
                        result.parent = parentId
                    })

                    subResults.unshift({ id: parentId, type: 'group', label, props: { group, title, description }, edges: [] })
                }

                if (maxNodesWarn && subResults.length > maxNodesWarn) {
                    this.emit('warn', `transform ${quotedTitle} will add ${subResults.length} nodes`)
                }

                if (maxNodesCap && subResults.length > maxNodesCap) {
                    this.emit('warn', `transform ${quotedTitle} nodes capped to ${maxNodesCap}`)

                    subResults = subResults.slice(0, maxNodesCap)
                }

                results = results.concat(subResults)
            }
        })

        results = [].concat(...results)

        this.emit('warn', `attempting to add ${results.length} elements`)

        const oldSelection = this.selection

        await this.addNodes(results)

        this.emit('warn', `finished adding ${results.length} elements`)

        if (weight) {
            this.measure(oldSelection)
        }

        return results
    }
}

module.exports = { Recon }
