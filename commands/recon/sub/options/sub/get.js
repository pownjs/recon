exports.yargs = {
    command: 'get <name>',
    describe: 'Get option',
    aliases: ['g'],

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

        const value = options.getOption(category, name)

        console.log(value)
    }
}
