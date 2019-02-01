exports.yargs = {
    command: 'transform <transform>',
    describe: 'Perform inline transformation',
    aliases: ['t'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('./utils/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const transformers = require('../transforms')

        Object.entries(transformers).forEach(([transformName, transform]) => {
            yargs.command({
                command: `${transformName.toLowerCase()} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    const { installOutputOptions } = require('./utils/output')

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

                    Object.entries(transform.options).forEach(([optionName, option]) => {
                        yargs.option(optionName, {
                            describe: option.description,
                            type: 'string',
                            default: option.default
                        })
                    })
                },

                handler: async(argv) => {
                    const { scout } = require('./utils/scout')

                    scout.registerTransforms({
                        [transformName]: transformers[transformName].load()
                    })

                    await handleReadOptions(argv, scout)

                    const { group, select, extract, nodes, ...rest } = argv

                    const options = {}

                    Object.keys(transform.options).forEach((optionName) => {
                        options[optionName] = rest[optionName]
                    })

                    if (select) {
                        scout.select(nodes)
                    }
                    else {
                        const { makeId } = require('../utils')

                        scout.addNodes(nodes.map((label) => ({ id: makeId(), type: 'string', label, props: { string: label }, edges: [] })))
                    }

                    let results = []

                    try {
                        results = await scout.transform(transformName, options, extract)
                    }
                    catch (e) {
                        console.error(e)
                    }

                    if (group) {
                        scout.group(group)
                    }

                    await handleWriteOptions(argv, scout)

                    const { handleOutputOptions } = require('./utils/output')

                    await handleOutputOptions(argv, results)
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
