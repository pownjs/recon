exports.yargs = {
    command: 'load <file>',
    describe: 'Load a file',
    aliases: ['l'],

    builder: (yargs) => {
        const { installWriteOptions } = require('../../lib/handlers/file')

        installWriteOptions(yargs)
    },

    handler: async(argv) => {
        const { file } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleWriteOptions, handleReadOptions } = require('../../lib/handlers/file')

        await handleWriteOptions(argv, recon)

        await handleReadOptions({ write: file }, recon)
    }
}
