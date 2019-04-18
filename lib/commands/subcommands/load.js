exports.yargs = {
    command: 'load <file>',
    describe: 'Load a file',
    aliases: ['l'],

    builder: (yargs) => {
        const { installWriteOptions } = require('./handlers/file')

        installWriteOptions(yargs)
    },

    handler: async(argv) => {
        const { file } = argv

        const { recon } = require('./globals/recon')

        const { handleWriteOptions, handleReadOptions } = require('./handlers/file')

        await handleWriteOptions(argv, recon)

        await handleReadOptions({ write: file }, recon)
    }
}
