exports.yargs = {
    command: 'set <name> <value>',
    describe: 'Set option',
    aliases: ['s'],

    builder: (yargs) => {
        yargs.option('category', {
            alias: ['c'],
            type: 'string',
            describe: 'Select category',
            default: 'global'
        })

        yargs.option('json', {
            alias: ['j'],
            type: 'boolean',
            describe: 'Assume the option is a json string',
            default: false
        })
    },

    handler: (argv) => {
        const { options } = require('../../../lib/globals/options')

        const { category, json, name, value } = argv

        if (json) {
            options.setOption(category, name, JSON.parse(value))
        }
        else {
            options.setOption(category, name, value)
        }
    }
}
