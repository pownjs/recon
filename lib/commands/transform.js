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
        scout.registerModuleTransforms('./transforms/urlscan')
        scout.registerModuleTransforms('./transforms/gravatar')
        scout.registerModuleTransforms('./transforms/dockerhub')
        scout.registerModuleTransforms('./transforms/cloudflare')
        scout.registerModuleTransforms('./transforms/threatcrowd')
        scout.registerModuleTransforms('./transforms/hackertarget')

        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('./lib/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        Object.entries(scout.transformers).forEach(([transformName, transform]) => {
            yargs.command({
                command: `${transformName} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    const { installOutputOptions } = require('./lib/output')

                    installOutputOptions(yargs)

                    yargs.options('select', {
                        alias: 's',
                        type: 'boolean',
                        describe: 'Use nodes as selector'
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
                    const { Logger } = require('@pown/cli/lib/logger')

                    const logger = new Logger(argv)

                    scout.on('info', logger.info)
                    scout.on('warn', logger.warn)
                    scout.on('error', logger.error)

                    await handleReadOptions(argv, scout, logger)

                    const { select, nodes, ...rest } = argv

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
                            results = await scout.transformCollection(collection, transformName, options)
                        }
                        else {
                            results = await scout.transform(transformName, options)
                        }
                    }
                    catch (e) {
                        logger.error(e)
                    }

                    const { handleOutputOptions } = require('./lib/output')

                    await handleOutputOptions(argv, results, logger)

                    await handleWriteOptions(argv, scout, logger)
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
