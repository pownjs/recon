exports.yargs = {
    command: 'ungroup <expressions...>',
    describe: 'Ungroup nodes',
    aliases: ['u'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./handlers/output')

        installOutputOptions(yargs)

        yargs.options('traverse', {
            alias: 'v',
            type: 'boolean',
            describe: 'Traverse graph',
            default: false
        })
    },

    handler: async(argv) => {
        const { traverse, expressions } = argv

        const { recon } = require('./globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('./handlers/file')

        await handleReadOptions(argv, recon)

        let resultNodes

        if (traverse) {
            resultNodes = recon.traverse(...expressions).map(node => node.data())
        }
        else {
            resultNodes = recon.select(...expressions).map(node => node.data())
        }

        await recon.ungroup()

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('./handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
