exports.yargs = {
    command: 'add <nodes...>',
    describe: 'Add nodes',
    aliases: ['a'],

    builder: (yargs) => {
        yargs.options('group', {
            alias: 'g',
            type: 'string',
            describe: 'Group nodes',
            default: ''
        })

        yargs.option('node-type', {
            type: 'string',
            describe: 'The type for new nodes from the command line',
            default: 'string'
        })

        const { installReadOptions, installWriteOptions } = require('./handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('./handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { group, nodeType, nodes } = argv

        const { recon } = require('./globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('./handlers/file')

        await handleReadOptions(argv, recon)

        const { makeId } = require('../../utils')

        const properNodes = nodes.map((node) => ({ id: makeId(), type: nodeType, label: node, props: { [nodeType]: node }, edges: [] }))

        recon.addNodes(properNodes)

        if (group) {
            recon.group(group)
        }

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('./handlers/output')

        await handleOutputOptions(argv, properNodes)
    }
}
