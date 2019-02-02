exports.yargs = {
    command: 'remove <expressions...>',
    describe: 'Remove nodes',
    aliases: ['r'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./options/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./options/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { expressions } = argv

        const { recon } = require('./globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('./options/file')

        await handleReadOptions(argv, recon)

        const nodes = recon.select(...expressions).map(node => node.data())

        recon.selection.remove()

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('./options/output')

        await handleOutputOptions(argv, nodes)
    }
}
