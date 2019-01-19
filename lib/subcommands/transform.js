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
        scout.registerModuleTransforms('./transforms/gravatar')
        scout.registerModuleTransforms('./transforms/dockerhub')
        scout.registerModuleTransforms('./transforms/cloudflare')
        scout.registerModuleTransforms('./transforms/threatcrowd')

        const { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions } = require('../file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        Object.entries(scout.transformers).forEach(([transformName, transform]) => {
            yargs.command({
                command: `${transformName} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    const output = require('../output')

                    output.options(yargs)

                    Object.entries(transform.options).forEach(([optionName, option]) => {
                        yargs.options(optionName, {
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

                    const { format, nodes } = argv

                    nodes.forEach((node) => {
                        scout.addStringNode(node)
                    })

                    const options = {}

                    Object.keys(transform.options).forEach((optionName) => {
                        options[optionName] = argv[optionName]
                    })

                    let results = []

                    try {
                        results = await scout.transform(transformName, options)
                    }
                    catch (e) {
                        logger.error(e)
                    }

                    const output = require('../output')

                    output.dump(logger, format, results)

                    await handleWriteOptions(argv, scout, logger)
                }
            })
        })
    },

    handler: (argv) => {
        argv.context.yargs.showHelp()
    }
}
