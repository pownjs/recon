exports.yargs = {
    command: 'exec <files...>',
    describe: 'Execute js file',
    aliases: ['c'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('../../lib/handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { files } = argv

        const path = require('path')
        const process = require('process')

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        for (let file of Array.isArray(files) ? files : [files]) {
            const module = require(path.join(process.cwd(), file)) // TODO: we should not be doing our own path resolve

            if (typeof(module) === 'function') {
                await module(recon)
            }
        }

        const resultNodes = recon.selection.map(node => node.data())

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
