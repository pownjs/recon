exports.yargs = {
    command: 'save <file>',
    describe: 'Save to file',
    aliases: ['o'],

    builder: (yargs) => {
        const { installReadOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)
    },

    handler: async(argv) => {
        const { file } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        await handleWriteOptions({ write: file }, recon)
    }
}
