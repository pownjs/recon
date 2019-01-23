exports.yargs = {
    command: 'transform <transform>',
    describe: 'Perform inline transformation',
    aliases: ['t'],

    builder: (yargs) => {
        const { Scout } = require('../scout')

        const scout = new Scout()

        scout.registerModuleTransforms('./transforms/pks')
        scout.registerModuleTransforms('./transforms/hibp')
        scout.registerModuleTransforms('./transforms/crtsh')
        scout.registerModuleTransforms('./transforms/github')
        scout.registerModuleTransforms('./transforms/zoomeye')
        scout.registerModuleTransforms('./transforms/urlscan')
        scout.registerModuleTransforms('./transforms/gravatar')
        scout.registerModuleTransforms('./transforms/dockerhub')
        scout.registerModuleTransforms('./transforms/cloudflare')
        scout.registerModuleTransforms('./transforms/threatcrowd')
        scout.registerModuleTransforms('./transforms/hackertarget')

        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('./utils/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        Object.entries(scout.transformers).forEach(([transformName, transform]) => {
            yargs.command({
                command: `${transformName} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    const { installOutputOptions } = require('./utils/output')

                    installOutputOptions(yargs)

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
                    scout.on('info', console.info.bind(console))
                    scout.on('warn', console.warn.bind(console))
                    scout.on('error', console.error.bind(console))

                    await handleReadOptions(argv, scout)

                    const { select, nodes, extract, ...rest } = argv

                    const options = {}

                    Object.keys(transform.options).forEach((optionName) => {
                        options[optionName] = rest[optionName]
                    })

                    let collection

                    if (select) {
                        collection = scout.selectCollection(nodes.join(','))
                    }
                    else {
                        nodes.forEach((node) => {
                            scout.addStringNode(node)
                        })
                    }

                    let results = []

                    try {
                        if (collection) {
                            results = await scout.transformCollection(collection, transformName, options, extract)
                        }
                        else {
                            results = await scout.transform(transformName, options, extract)
                        }
                    }
                    catch (e) {
                        console.error(e)
                    }

                    const { handleOutputOptions } = require('./utils/output')

                    await handleOutputOptions(argv, results)

                    await handleWriteOptions(argv, scout)
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
