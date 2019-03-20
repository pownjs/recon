exports.yargs = {
    command: 'save <file>',
    describe: 'Save to file',
    aliases: ['a'],

    builder: (yargs) => {
        const { installReadOptions } = require('./handlers/file')

        installReadOptions(yargs)
    },

    handler: async(argv) => {
        const { file } = argv

        const { recon } = require('./globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('./handlers/file')

        await handleReadOptions(argv, recon)

        await handleWriteOptions({ write: file }, recon)
    }
}
