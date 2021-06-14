exports.yargs = {
    command: '$0 <expressions...>',

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('../../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('../../../lib/handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { expressions } = argv

        const { recon } = require('../../../lib/globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('../../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        const resultNodes = recon.traverse(...expressions).map(node => node.data())

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('../../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
