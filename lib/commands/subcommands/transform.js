exports.yargs = {
    command: 'transform <transform>',
    describe: 'Perform inline transformation',
    aliases: ['t'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('./handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const transformers = require('../../transforms')

        const auto = {
            aliases: ['a'],
            description: 'Select the most appropriate methods of transformation',
            options: {
                name: {
                    description: 'Select only name matching transforms',
                    default: '*'
                },

                alias: {
                    description: 'Select only alias matching transforms',
                    default: '*'
                },

                title: {
                    description: 'Select only title matching transforms',
                    default: '*'
                }
            },
            noise: 0
        }

        Object.entries({ ...transformers, auto }).forEach(([transformName, transform]) => {
            yargs.command({
                command: `${transformName.toLowerCase()} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    const { installOutputOptions } = require('./handlers/output')

                    installOutputOptions(yargs)

                    yargs.options('noise', {
                        alias: 'n',
                        type: 'number',
                        describe: 'Maximum noise level',
                        default: 10
                    })

                    yargs.options('select', {
                        alias: 's',
                        type: 'boolean',
                        describe: 'Select nodes',
                        default: false
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
                        default: 100
                    })

                    yargs.option('max-nodes-cap', {
                        type: 'number',
                        describe: 'Warn when more than allowed nodes are to be inserted',
                        default: 200
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

                    yargs.option('node-type', {
                        type: 'string',
                        describe: 'The type for new nodes from the command line',
                        default: 'string'
                    })

                    Object.entries(transform.options).forEach(([optionName, option]) => {
                        yargs.option(optionName, {
                            describe: option.description,
                            type: 'string',
                            default: option.default
                        })
                    })
                },

                handler: async(argv) => {
                    const { noise, select, group, autoGroup, autoWeight, maxNodesWarn, maxNodesCap, extract, extractPrefix, extractSuffix, nodeType, nodes, ...rest } = argv

                    const { recon } = require('./globals/recon')

                    if (transformName === 'auto') {
                        const { name, alias, title } = argv

                        const nameRegExp = new RegExp(name.replace(/\*|%/, '.*'), 'i')
                        const aliasRegExp = new RegExp(alias.replace(/\*|%/, '.*'), 'i')
                        const titleRegExp = new RegExp(title.replace(/\*|%/, '.*'), 'i')

                        Object.entries(transformers).forEach(([name, transform]) => {
                            if (nameRegExp.test(name) && titleRegExp.test(transform.title) && transform.alias.some((alias) => aliasRegExp.test(alias))) {
                                recon.registerTransforms({
                                    [name]: transform.load()
                                })
                            }
                        })
                    }
                    else {
                        recon.registerTransforms({
                            [transformName]: transform.load()
                        })
                    }

                    await handleReadOptions(argv, recon)

                    const options = {}

                    Object.keys(transform.options).forEach((optionName) => {
                        options[optionName] = rest[optionName]
                    })

                    if (select) {
                        recon.select(nodes)
                    }
                    else {
                        const { makeId } = require('../../utils')

                        recon.addNodes(nodes.map((node) => ({
                            id: makeId(nodeType, node),
                            type: nodeType,
                            label: node,
                            props: {
                                [nodeType]: node
                            },
                            edges: []
                        })))
                    }

                    let results = []

                    try {
                        results = await recon.transform(transformName === 'auto' ? '*' : transformName, options, { noise, group: autoGroup, weight: autoWeight, maxNodesWarn, maxNodesCap, extract: { property: extract, prefix: extractPrefix, suffix: extractSuffix } })
                    }
                    catch (e) {
                        console.error(e)
                    }

                    if (group) {
                        recon.group(group)
                    }

                    await handleWriteOptions(argv, recon)

                    const { handleOutputOptions } = require('./handlers/output')

                    await handleOutputOptions(argv, results)
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
