exports.yargs = {
    command: 'transform <transform>',
    describe: 'Perform inline transformation',
    aliases: ['t'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('./options/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const transformers = require('../../transforms')

        Object.entries(transformers).forEach(([transformName, transform]) => {
            yargs.command({
                command: `${transformName.toLowerCase()} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    const { installOutputOptions } = require('./options/output')

                    installOutputOptions(yargs)

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
                    const { group, select, extract, extractPrefix, extractSuffix, nodeType, nodes, ...rest } = argv

                    const { scout } = require('./globals/scout')

                    scout.registerTransforms({
                        [transformName]: transformers[transformName].load()
                    })

                    await handleReadOptions(argv, scout)

                    const options = {}

                    Object.keys(transform.options).forEach((optionName) => {
                        options[optionName] = rest[optionName]
                    })

                    if (select) {
                        scout.select(nodes)
                    }
                    else {
                        const { makeId } = require('../../utils')

                        scout.addNodes(nodes.map((node) => ({ id: makeId(), type: nodeType, label: node, props: { string: node }, edges: [] })))
                    }

                    let results = []

                    try {
                        results = await scout.transform(transformName, options, { extract: { property: extract, prefix: extractPrefix, suffix: extractSuffix } })
                    }
                    catch (e) {
                        console.error(e)
                    }

                    if (group) {
                        scout.group(group)
                    }

                    await handleWriteOptions(argv, scout)

                    const { handleOutputOptions } = require('./options/output')

                    await handleOutputOptions(argv, results)
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
