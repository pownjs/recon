exports.yargs = {
    command: 'select <expressions...>',
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
        const { expressions } = argv

        const { scout } = require('./utils/scout')

        const { handleReadOptions, handleWriteOptions } = require('./utils/file')

        await handleReadOptions(argv, scout)

        const nodes = scout.select(...expressions).map(node => node.data())

        await handleWriteOptions(argv, scout)

        const { handleOutputOptions } = require('./utils/output')

        await handleOutputOptions(argv, nodes)
    }
}
