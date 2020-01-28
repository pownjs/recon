exports.yargs = {
    command: 'set <name> <value>',
    describe: 'Set option',
    aliases: ['s'],

    builder: (yargs) => {
        yargs.option('category', {
            alias: ['c'],
            describe: 'Select category',
            default: 'global'
        })
    },

    handler: (argv) => {
        const { options } = require('../../../lib/globals/options')

        const { category, name, value } = argv

        options.setOption(category, name, JSON.parse(value))
    }
}
