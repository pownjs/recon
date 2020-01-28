exports.yargs = {
    command: 'group <name> <expressions...>',
    describe: 'Group nodes',
    aliases: ['g'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('../../lib/handlers/output')

        installOutputOptions(yargs)

        yargs.options('traverse', {
            alias: 'v',
            type: 'boolean',
            describe: 'Traverse graph',
            default: false
        })
    },

    handler: async(argv) => {
        const { traverse, name, expressions } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        let resultNodes

        if (traverse) {
            resultNodes = recon.traverse(...expressions).map(node => node.data())
        }
        else {
            resultNodes = recon.select(...expressions).map(node => node.data())
        }

        await recon.group(name)

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
