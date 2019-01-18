exports.yargs = {
    command: 'recon <transform>',
    describe: 'Target recon',

    builder: (yargs) => {
        const { Scout } = require('./scout')

        const scout = new Scout()

        scout.registerModuleTransforms('./transforms/github')
        scout.registerModuleTransforms('./transforms/threatcrowd')

        Object.entries(scout.transformers).forEach(([transformName, transform]) => {
            yargs = yargs.command({
                command: `${transformName} [options] <nodes...>`,
                aliases: transform.alias,
                describe: transform.description,

                builder: (yargs) => {
                    yargs = yargs.options('format', {
                        description: 'Output format',
                        alias: 'f',
                        type: 'string',
                        default: 'table',
                        choices: ['table', 'json', 'csv']
                    })

                    Object.entries(transform.options).forEach(([optionName, option]) => {
                        yargs = yargs.options(optionName, {
                            describe: option.description,
                            type: 'string',
                            default: option.default
                        })
                    })
                },

                handler: async(argv) => {
                    const { Logger } = require('@pown/cli/lib/logger')

                    const logger = new Logger(argv)

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

                    if (format === 'table') {
                        const fields = {}
                        const lines = []

                        results.forEach(({ props }) => {
                            const line = {}

                            Object.entries(props).forEach(([name, value]) => {
                                fields[name] = 1
                                line[name] = value
                            })

                            lines.push(line)
                        })

                        const fieldNames = Object.keys(fields)

                        const { Table } = require('@pown/cli/lib/table')

                        const table = new Table({
                            head: fieldNames
                        })

                        lines.forEach((line) => {
                            const fieldValues = fieldNames.map((name) => line[name] || '')

                            table.push(fieldValues)
                        })

                        logger.verbose(table.toString())
                    }
                    else
                    if (format === 'json') {
                        logger.verbose('[');

                        results.forEach(({ props }) => {
                            logger.verbose(JSON.stringify(props))
                        })

                        logger.verbose(']');
                    }
                    else
                    if (format === 'csv') {
                        const fields = {}
                        const lines = []

                        results.forEach(({ props }) => {
                            const line = {}

                            Object.entries(props).forEach(([name, value]) => {
                                fields[name] = 1
                                line[name] = value
                            })

                            lines.push(line)
                        })

                        const fieldNames = Object.keys(fields)

                        logger.verbose('#' + fieldNames.join(','))

                        lines.forEach((line) => {
                            const fieldValues = fieldNames.map((name) => JSON.stringify(line[name] || ''))

                            logger.verbose(fieldValues.join(','))
                        })
                    }
                }
            })
        })
    }
}
