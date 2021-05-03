const assert = require('assert')
const process = require('process')
const { EventEmitter } = require('events')
const { setInterval, clearInterval } = require('timers')
const { iterateOfLimit } = require('@pown/async/lib/iterateOfLimit')

const { cytoscape } = require('./cytoscape')
const { makeId, isIterable, isAsyncIterable } = require('./utils')
const { isUrl, isEmail, isIpv4, isIpv6, isDomain } = require('./detect')
const { URL_TYPE, EMAIL_TYPE, IPV4_TYPE, IPV6_TYPE, DOAMIN_TYPE } = require('./types')

class Recon extends EventEmitter {
    constructor(options) {
        super()

        const { maxNodesWarn = 0, maxNodesCap = 0, optionsInstance, ...settings } = options || {}

        this.maxNodesWarn = maxNodesWarn
        this.maxNodesCap = maxNodesCap
        this.optionsInstance = optionsInstance

        this.reset(settings)

        this.transforms = {}
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

    registerTransforms(transforms) {
        Object.entries(transforms).forEach(([name, transform]) => {
            this.transforms[name.toLowerCase()] = transform.load ? transform.load() : transform
        })
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

            this.emit('barStart', 'Adding nodes', { total: nodes.length })

            updateProgres = (c = 0) => this.emit('barStep', 'Adding nodes', { step: (index += c) })
            endProgress = () => this.emit('barEnd', 'Adding nodes')
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

            this.emit('barStart', 'Removing nodes', { total: nodes.length })

            updateProgres = (c = 0) => this.emit('barStep', 'Removing nodes', { step: (index += c) })
            endProgress = () => this.emit('barEnd', 'Removing nodes')
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

    async * transformIt(transformation, options = {}, settings = {}) {
        const { transformConcurrency = Infinity, nodeConcurrency = Infinity, timeout = 0, group = false, filter, extract, maxNodesWarn = this.maxNodesWarn, maxNodesCap = this.maxNodesCap, optionsInstance = this.optionsInstance, scheduler, cache } = settings

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

            const transform = new this.transforms[transformName]({ scheduler })

            transform.name = transformName

            if (cache) {
                transform.handle = (function(handle) {
                    return async function(node, options, ...args) {
                        let result = await cache.get(transformName, node, options)

                        if (!result) {
                            result = await handle.call(this, node, options, ...args)

                            cache.set(transformName, node, options)
                        }

                        return result
                    }
                })(transform.handle)
            }

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
                        return (name && name.test(constructor.name)) || (alias && constructor.alias.some((alias) => alias.test(alias))) || (title && title.test(constructor.title)) || (tag && constructor.tags.some((tag) => tag.test(tag)))
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

        const handleTransform = async(transform) => {
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

                this.emit('debug', Object.entries(process.memoryUsage()).map(([name, value]) => `${name}=${Math.round(value / 1024 / 1024 * 100) / 100}MB`).join(', '))
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

                // NOTE: user-supplied options take priority

                ...options
            }

            let results

            try {
                const tasks = [transform.run(actualNodes, actualOptions, nodeConcurrency)]

                if (timeout > 0) {
                    // TODO: add implementation
                    // NOTE: at the moment this is not possible with promises
                }

                results = await Promise.race(tasks)
            }
            catch (e) {
                results = []

                this.emit('warn', `transform ${quotedTitle} failed`)
                this.emit('error', `${title}:`, e)
            }

            clearInterval(interval)

            transform.off('progress', progressHandler)

            if (results && results.length) {
                this.emit('info', `transform ${quotedTitle} finished with ${results.length} results`)

                if (group) {
                    const { group, title, description } = transform.constructor

                    const label = group

                    const parentId = makeId('group', label)

                    results.forEach((result) => {
                        result.parent = parentId
                    })

                    results.unshift({ id: parentId, type: 'group', label, props: { group, title, description }, edges: [] })
                }

                if (maxNodesWarn && results.length > maxNodesWarn) {
                    this.emit('warn', `transform ${quotedTitle} will add ${results.length} nodes`)
                }

                if (maxNodesCap && results.length > maxNodesCap) {
                    this.emit('warn', `transform ${quotedTitle} nodes capped to ${maxNodesCap}`)

                    results = results.slice(0, maxNodesCap)
                }

                return results
            }
        }

        for await (let results of iterateOfLimit(transforms, transformConcurrency, handleTransform)) {
            yield* results
        }
    }

    async transform(transformation, options = {}, settings = {}) {
        const { weight = false } = settings

        const results = []

        for await (let result of this.transformIt(transformation, options, settings)) {
            results.push(result)
        }

        this.emit('warn', `attempting to add ${results.length} elements`)

        const oldSelection = this.selection

        await this.addNodes(results)

        this.emit('warn', `finished adding ${results.length} elements`)

        if (weight) {
            this.measure(oldSelection)
        }

        return results
    }

    // NOTE: legacy methods

    addNodes(...props) {
        return this.add(...props)
    }

    removeNodes(...props) {
        return this.remove(...props)
    }
}

module.exports = { Recon }
