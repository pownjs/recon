exports.yargs = {
    command: 'select <expressions...>',
    describe: 'Perform a selection',
    aliases: ['s'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./options/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./options/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { expressions } = argv

        const { scout } = require('./globals/scout')

        const { handleReadOptions, handleWriteOptions } = require('./options/file')

        await handleReadOptions(argv, scout)

        const nodes = scout.select(...expressions).map(node => node.data())

        await handleWriteOptions(argv, scout)

        const { handleOutputOptions } = require('./options/output')

        await handleOutputOptions(argv, nodes)
    }
}
