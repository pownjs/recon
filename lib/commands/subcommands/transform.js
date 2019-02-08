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
            options: {},
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

                    yargs.options('group', {
                        alias: 'g',
                        type: 'string',
                        describe: 'Group nodes',
                        default: ''
                    })

                    yargs.options('select', {
                        alias: 's',
                        type: 'boolean',
                        describe: 'Select nodes',
                        default: false
                    })

                    yargs.options('auto-group', {
                        alias: 'a',
                        type: 'boolean',
                        describe: 'Auto group',
                        default: false
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
                    const { noise, group, select, autoGroup, extract, extractPrefix, extractSuffix, nodeType, nodes, ...rest } = argv

                    const { recon } = require('./globals/recon')

                    if (transformName === 'auto') {
                        Object.entries(transformers).forEach(([transformName, transform]) => {
                            recon.registerTransforms({
                                [transformName]: transform.load()
                            })
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
                            id: makeId(),
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
                        results = await recon.transform(transformName === 'auto' ? '*' : transformName, options, { noise, group: autoGroup, extract: { property: extract, prefix: extractPrefix, suffix: extractSuffix } })
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
