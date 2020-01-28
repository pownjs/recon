exports.yargs = {
    command: 'set <name> <value>',
    describe: 'Set option',
    aliases: ['s'],

    builder: {},

    handler: async(argv) => {
        const { options } = require('../../../lib/globals/options')

        const { name, value } = argv

        await options.setOption(name, value)
    }
}
