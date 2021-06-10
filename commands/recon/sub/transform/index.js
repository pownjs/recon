exports.yargs = {
    command: 'transform <transform>',
    describe: 'Perform inline transformation',
    aliases: ['t'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { getCompoundTransforms } = require('./transforms')

        const compoundTransforms = getCompoundTransforms()

        const auto = {
            aliases: ['a'],

            description: 'Select the most appropriate methods of transformation',

            options: {
                name: {
                    description: 'Select only name matching transforms',
                    default: ''
                },

                alias: {
                    description: 'Select only alias matching transforms',
                    default: ''
                },

                title: {
                    description: 'Select only title matching transforms',
                    default: ''
                },

                tag: {
                    description: 'Select only alias matching transforms',
                    default: ''
                }
            },

            noise: 0,
            priority: 0
        }

        Object.entries({ ...compoundTransforms, auto }).forEach(([transformName, transform]) => {
            const niceTransformName = transformName.toLowerCase()

            const transformAlias = !transform.alias ? [] : Array.isArray(transform.alias) ? transform.alias : [transform.alias]
            const transformDescription = !transform.description ? '' : transform.description

            yargs.command({
                command: `${niceTransformName} [options] <nodes...>`,
                aliases: transformAlias,
                describe: transformDescription,

                builder: (yargs) => {
                    const { installOutputOptions } = require('../../lib/handlers/output')

                    installOutputOptions(yargs)

                    yargs.options('transform-concurrency', {
                        alias: 'c',
                        type: 'number',
                        describe: 'Number of transform operations to execute at the same time',
                        default: 100
                    })

                    yargs.options('node-concurrency', {
                        alias: 'C',
                        type: 'number',
                        describe: 'Number of nodes to transform at the same time',
                        default: 500
                    })

                    yargs.options('transform-timeout', {
                        alias: 'T',
                        type: 'number',
                        describe: 'Transform max lifetime (milliseconds)',
                        default: 0
                    })

                    yargs.options('transform-in-worker', {
                        alias: 'W',
                        type: 'boolean',
                        describe: 'Run transforms in worker threads',
                        default: false
                    })

                    yargs.options('load', {
                        alias: 'l',
                        type: 'boolean',
                        describe: 'Load nodes from file',
                        default: false
                    })

                    yargs.options('select', {
                        alias: 's',
                        type: 'boolean',
                        describe: 'Select graph',
                        default: false
                    })

                    yargs.options('traverse', {
                        alias: 'v',
                        type: 'boolean',
                        describe: 'Traverse graph',
                        default: false
                    })

                    yargs.options('noise', {
                        alias: 'n',
                        type: 'number',
                        describe: 'Maximum noise level',
                        default: 10
                    })

                    yargs.options('group', {
                        alias: 'g',
                        type: 'string',
                        describe: 'Group nodes',
                        default: ''
                    })

                    yargs.options('auto-group', {
                        alias: 'a',
                        type: 'boolean',
                        describe: 'Auto group nodes',
                        default: false
                    })

                    yargs.options('auto-weight', {
                        alias: 't',
                        type: 'boolean',
                        describe: 'Auto weight nodes',
                        default: false
                    })

                    yargs.option('max-nodes-warn', {
                        type: 'number',
                        describe: 'Warn when more than allowed nodes are to be inserted',
                        default: 200
                    })

                    yargs.option('max-nodes-cap', {
                        type: 'number',
                        describe: 'Warn when more than allowed nodes are to be inserted',
                        default: Infinity
                    })

                    yargs.options('extract', {
                        alias: 'e',
                        type: 'string',
                        describe: 'Extract fields'
                    })

                    yargs.option('extract-prefix', {
                        type: 'string',
                        describe: 'Prefix after extraction',
                        default: ''
                    })

                    yargs.option('extract-suffix', {
                        type: 'string',
                        describe: 'Suffix after extraction',
                        default: ''
                    })

                    yargs.options('cache-memcached-server', {
                        type: 'string',
                        describe: 'A memcached server address[:port]',
                        default: ''
                    })

                    yargs.options('cache-dynamodb-table', {
                        type: 'string',
                        describe: 'A dynamodb table name',
                        default: ''
                    })

                    yargs.options('cache-ttl', {
                        type: 'number',
                        describe: 'Cache max lifetime (seconds)',
                        default: 60
                    })

                    yargs.options('cache-key-prefix', {
                        type: 'string',
                        describe: 'Prefix to add to keys',
                        default: ''
                    })

                    yargs.options('cache-key-suffix', {
                        type: 'string',
                        describe: 'Suffix to add to keys',
                        default: ''
                    })

                    yargs.option('node-type', {
                        type: 'string',
                        describe: 'The type for new nodes from the command line',
                        default: 'string'
                    })

                    const { options: gOptions } = require('../../lib/globals/options')

                    const defaultOptions = {}

                    for (let category of [niceTransformName, ...transformAlias]) {
                        for (let option of gOptions.listOptions(category)) {
                            defaultOptions[option.name] = option.value
                        }
                    }

                    Object.entries(transform.options).forEach(([optionName, { aliases, alias = aliases, description, describe = description, 'default': _default, ...rest }]) => {
                        optionName = optionName.replace(/([A-Z])/g, '-$1').replace(/^-+/, '').toLowerCase()

                        yargs.option(optionName, {
                            ...rest,

                            alias: (Array.isArray(alias) ? alias : [alias]).filter(l => l && l.length > 1),

                            describe: describe,

                            default: defaultOptions.hasOwnProperty(optionName) ? defaultOptions[optionName] : _default
                        })
                    })
                },

                handler: async(argv) => {
                    const { transformConcurrency, nodeConcurrency, transformInWorker, transformTimeout, load, select, traverse, noise, group, autoGroup, autoWeight, maxNodesWarn, maxNodesCap, extract, extractPrefix, extractSuffix, cacheMemcachedServer, cacheDynamodbTable, cacheTtl, cacheKeyPrefix, cacheKeySuffix, nodeType, nodes, ...rest } = argv

                    const { getCache } = require('../../lib/globals/cache')
                    const { wrapInWorker } = require('../../../../lib/worker')
                    const { Scheduler } = require('../../../../lib/scheduler')
                    const { recon: gRecon } = require('../../lib/globals/recon')
                    const { options: gOptions } = require('../../lib/globals/options')

                    let filter = {
                        noise
                    }

                    if (transformName === 'auto') {
                        const { name, alias, title, tag } = argv

                        const regexify = (input) => {
                            if (input.startsWith('!')) {
                                input = input.slice(1).replace(/\*|%/g, '.*')

                                const regex = new RegExp(`^(?:${input})$`, 'i')

                                regex.test = (function(test) {
                                    return function(input) {
                                        return !test.call(this, input)
                                    }
                                })(regex.test)

                                return regex
                            }
                            else {
                                input = input.replace(/\*|%/g, '.*')

                                const regex = new RegExp(`^(?:${input})$`, 'i')

                                return regex
                            }
                        }

                        filter = {
                            ...filter,

                            name: name ? regexify(name) : undefined,
                            alias: alias ? regexify(alias) : undefined,
                            title: title ? regexify(title) : undefined,
                            tag: tag ? regexify(tag) : undefined
                        }

                        gRecon.registerTransforms(transformInWorker ? Object.assign({}, ...Object.entries(compoundTransforms).map(([name, transform]) => {
                            return {
                                [name]: wrapInWorker(transform)
                            }
                        })) : compoundTransforms)
                    }
                    else {
                        gRecon.registerTransforms({
                            [transformName]: transformInWorker ? wrapInWorker(transform) : transform
                        })
                    }

                    await handleReadOptions(argv, gRecon)

                    const options = {}

                    Object.keys(transform.options).forEach((optionName) => {
                        options[optionName] = rest[optionName]
                    })

                    if (select) {
                        gRecon.select(...nodes)
                    }
                    else
                    if (traverse) {
                        gRecon.traverse(...nodes)
                    }
                    else {
                        let realNodes = nodes

                        const { makeId } = require('../../../../lib/utils')

                        if (load) {
                            const { iterateFileLines } = require('@pown/file/lib/iterateFileLines')
                            const { toArray } = require('@pown/async/lib/utils')
                            const { unrollOfParallel } = require('@pown/async/lib/unrollOfParallel')

                            realNodes = await toArray(unrollOfParallel(realNodes.map(iterateFileLines)))
                        }

                        await gRecon.addNodes(realNodes.filter((node) => node).map((node) => ({
                            id: makeId(nodeType, node),
                            type: nodeType,
                            label: node,
                            props: {
                                [nodeType]: node
                            },
                            edges: []
                        })))
                    }

                    let cache = getCache()

                    if (cache) {
                        console.info('using global cache')
                    }

                    if (cacheMemcachedServer) {
                        const { Cache } = require('../../../../lib/cache/memcached')

                        cache = new Cache({ hosts: [cacheMemcachedServer], ttl: cacheTtl, keyPrefix: cacheKeyPrefix, keySuffix: cacheKeySuffix })

                        console.info('caching with memcached server', JSON.stringify(cacheMemcachedServer))
                    }
                    else
                    if (cacheDynamodbTable) {
                        const { Cache } = require('../../../../lib/cache/dynamodb')

                        cache = new Cache({ table: cacheDynamodbTable, ttl: cacheTtl, keyPrefix: cacheKeyPrefix, keySuffix: cacheKeySuffix })

                        console.info('caching with dynamodb table', JSON.stringify(cacheDynamodbTable))
                    }

                    const scheduler = new Scheduler()

                    try {
                        await gRecon.transform(transformName, options, { transformConcurrency, nodeConcurrency, timeout: transformTimeout, group: autoGroup, weight: autoWeight, maxNodesWarn, maxNodesCap, filter, extract: { property: extract, prefix: extractPrefix, suffix: extractSuffix }, optionsInstance: gOptions, scheduler, cache })
                    }
                    catch (e) {
                        console.error(e)
                    }

                    if (group) {
                        gRecon.group(group)
                    }

                    const resultNodes = gRecon.selection.map(node => node.data())

                    await handleWriteOptions(argv, gRecon)

                    const { handleOutputOptions } = require('../../lib/handlers/output')

                    await handleOutputOptions(argv, resultNodes)

                    if (cache) {
                        await cache.end()
                    }

                    await gRecon.resetTransforms()
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
