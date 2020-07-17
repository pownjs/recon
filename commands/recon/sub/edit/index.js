exports.yargs = {
    command: 'edit <expressions...>',
    describe: 'Edit nodes',
    aliases: ['e'],

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

        yargs.options('auto-weight', {
            alias: 't',
            type: 'boolean',
            describe: 'Auto weight nodes',
            default: false
        })
    },

    handler: async(argv) => {
        const { traverse, autoWeight, expressions } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        let resultNodes

        if (traverse) {
            resultNodes = recon.traverse(...expressions)
        }
        else {
            resultNodes = recon.select(...expressions)
        }

        if (autoWeight) {
            recon.measure(resultNodes)
        }

        resultNodes = resultNodes.map(node => node.data())

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
