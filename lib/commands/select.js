exports.yargs = {
    command: 'select <expression>',
    describe: 'Perform a selection',
    aliases: ['s'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./utils/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./utils/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { expression } = argv

        const { Scout } = require('../scout')

        const { handleReadOptions, handleWriteOptions } = require('./utils/file')

        const scout = new Scout()

        await handleReadOptions(argv, scout)

        const nodes = scout.selectCollection(expression).map(node => node.data())

        const { handleOutputOptions } = require('./utils/output')

        await handleOutputOptions(argv, nodes)

        await handleWriteOptions(argv, scout)
    }
}
