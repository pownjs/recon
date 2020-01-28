exports.yargs = {
    command: 'delete <name>',
    describe: 'Delete option',
    aliases: ['d'],

    builder: (yargs) => {
        yargs.option('category', {
            alias: ['c'],
            describe: 'Select category',
            default: 'global'
        })
    },

    handler: (argv) => {
        const { options } = require('../../../lib/globals/options')

        const { category, name } = argv

        options.deleteOption(category, name)
    }
}
