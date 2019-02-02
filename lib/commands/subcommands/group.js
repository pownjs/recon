exports.yargs = {
    command: 'group <name> <selectors...>',
    describe: 'Group nodes',
    aliases: ['g'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { name, selectors } = argv

        const { recon } = require('./globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('./handlers/file')

        await handleReadOptions(argv, recon)

        const nodes = recon.select(...selectors).map(node => node.data())

        recon.group(name)

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('./handlers/output')

        await handleOutputOptions(argv, nodes)
    }
}
