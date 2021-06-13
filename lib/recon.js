const os = require('os')
const process = require('process')
const { setInterval, clearInterval } = require('timers')
const { iterateOfLimit } = require('@pown/async/lib/iterateOfLimit')

const { Graph } = require('./graph')
const { makeId } = require('./utils')
const { isUrl, isEmail, isIpv4, isIpv6, isDomain } = require('./detect')
const { URL_TYPE, EMAIL_TYPE, IPV4_TYPE, IPV6_TYPE, DOAMIN_TYPE } = require('./types')

class Recon extends Graph {
    constructor(options) {
        super(options)

        this.transforms = {}
    }

    registerTransforms(transforms) {
        Object.entries(transforms).forEach(([name, transform]) => {
            this.transforms[name.toLowerCase()] = transform.load ? transform.load() : transform // TODO: remove this type of loading
        })
    }

    resetTransforms() {
        this.transforms = []
    }

    async * itr(transformation, options = {}, settings = {}) {
        transformation = transformation.toLowerCase()

        const { transformConcurrency = Infinity, nodeConcurrency = Infinity, timeout = 0, group = false, filter, extract, maxNodesWarn = this.maxNodesWarn, maxNodesCap = this.maxNodesCap, optionsInstance = this.optionsInstance, scheduler, cache } = settings

        let transformNames

        if (['*', 'auto'].includes(transformation)) {
            transformNames = Object.keys(this.transforms)
        }
        else {
            transformNames = [transformation]
        }

        let transforms = transformNames
            .map((transformName) => {
                if (!this.transforms.hasOwnProperty(transformName)) {
                    throw new Error(`Unknown transform ${transformName}`)
                }

                let TransformClass

                if (cache) {
                    TransformClass = class extends this.transforms[transformName] {
                        async handle(node, options, ...args) {
                            let result

                            try {
                                result = await cache.get(transformName, node, options)
                            }
                            catch (e) {
                                this.error('error', e)
                            }

                            if (!result) {
                                result = await super.handle(node, options, ...args)

                                try {
                                    await cache.set(transformName, node, options, result)
                                }
                                catch (e) {
                                    this.error('error', e)
                                }
                            }
                            else {
                                this.info('value retrieved from cache')
                            }

                            return result
                        }
                    }
                }
                else {
                    TransformClass = this.transforms[transformName]
                }

                return { transformName, TransformClass }
            })
            .filter(({ TransformClass }) => {
                if (!['*', 'auto'].includes(transformation)) {
                    return true
                }

                if (filter) {
                    const { noise = 10, name, alias, title, tag } = filter

                    if (TransformClass.noise > noise) {
                        return false
                    }

                    if (name || alias || title || tag) {
                        return (name && name.test(TransformClass.name)) || (alias && TransformClass.alias.some((alias) => alias.test(alias))) || (title && title.test(TransformClass.title)) || (tag && TransformClass.tags.some((tag) => tag.test(tag)))
                    }
                }

                return true
            })
            .map(({ transformName, TransformClass }) => {
                const transform = new TransformClass({ scheduler })

                transform.name = transformName

                const title = JSON.stringify(transform.constructor.title)

                transform.on('info', (...args) => {
                    this.emit('info', 'transform', title, ':::', ...args)
                })

                transform.on('warn', (...args) => {
                    this.emit('warn', 'transform', title, ':::', ...args)
                })

                transform.on('error', (...args) => {
                    this.emit('error', 'transform', title, ':::', ...args)
                })

                transform.on('debug', (...args) => {
                    this.emit('debug', 'transform', title, ':::', ...args)
                })

                return transform
            })

        let nodes = this.selection.map((node) => {
            return node.data()
        })

        if (['*', 'auto'].includes(transformation)) {
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

            const progressHandler = (s, ss = actualNodes.length) => {
                step = s
                steps = ss
            }

            transform.on('progress', progressHandler)

            this.emit('info', `starting transform ${quotedTitle} on ${actualNodes.length} nodes`)

            const interval = setInterval(() => {
                if (step > 0 || steps > 0) {
                    this.emit('info', 'transform', quotedTitle, 'still running', `${step}/${steps}`)
                }
                else {
                    this.emit('info', 'transform', quotedTitle, 'still running')
                }

                this.emit('debug', `freemem=${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`, ...Object.entries(process.memoryUsage()).map(([name, value]) => `${name}=${Math.round(value / 1024 / 1024 * 100) / 100}MB`))
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

                this.emit('warn', 'transform', quotedTitle, 'failed')
                this.emit('error', title, ':', e)
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

        const nodes = []

        for await (let node of this.itr(transformation, options, settings)) {
            nodes.push(node)
        }

        if (nodes.length) {
            this.emit('warn', `attempting to add ${nodes.length} nodes`)

            const oldSelection = this.selection

            await this.addNodes(nodes)

            this.emit('warn', `finished adding ${nodes.length} nodes`)

            if (weight) {
                await this.measure(oldSelection)
            }
        }
        else {
            this.emit('warn', 'nothing to add')
        }

        return this.selection
    }
}

module.exports = { Recon }
