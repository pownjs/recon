exports.yargs = {
    command: 'exec <files...>',
    describe: 'Execute js file',
    aliases: ['c'],

    builder: (yargs) => {},

    handler: async(argv) => {
        const { files } = argv

        const path = require('path')
        const process = require('process')

        const { recon } = require('../../lib/globals/recon')

        for (let file of Array.isArray(files) ? files : [files]) {
            const module = require(path.join(process.cwd(), file))

            if (typeof(module) === 'function') {
                await module(recon)
            }
        }
    }
}
