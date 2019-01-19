exports.yargs = {
    command: 'select <expression>',
    describe: 'Perform a selection',
    aliases: ['s'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./lib/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./lib/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { Logger } = require('@pown/cli/lib/logger')

        const logger = new Logger(argv)

        const { expression } = argv

        const { Scout } = require('../scout')

        const { handleReadOptions, handleWriteOptions } = require('./lib/file')

        const scout = new Scout()

        await handleReadOptions(argv, scout, logger)

        const nodes = scout.selectCollection(expression).map(node => node.data())

        const { handleOutputOptions } = require('./lib/output')

        await handleOutputOptions(argv, nodes, logger)

        await handleWriteOptions(argv, scout, logger)
    }
}
