exports.yargs = {
    command: 'select <expression>',
    describe: 'Perform a selection',
    aliases: ['s'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('../file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('../output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { Logger } = require('@pown/cli/lib/logger')

        const logger = new Logger(argv)

        const { expression } = argv

        const { Scout } = require('../scout')

        const { handleReadOptions, handleWriteOptions } = require('../file')

        const scout = new Scout()

        await handleReadOptions(argv, scout, logger)

        const nodes = scout.selectCollection(expression).map(node => node.data())

        const { handleOutputOptions } = require('../output')

        await handleOutputOptions(argv, nodes, logger)

        await handleWriteOptions(argv, scout, logger)
    }
}
