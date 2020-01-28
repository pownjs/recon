exports.yargs = {
    command: 'clear',
    describe: 'Clear options',
    aliases: ['c'],

    builder: (yargs) => {
        yargs.option('category', {
            alias: ['c'],
            describe: 'Select category',
            default: 'global'
        })
    },

    handler: (argv) => {
        const { options } = require('../../../lib/globals/options')

        const { category } = argv

        options.clearOptions(category)
    }
}
