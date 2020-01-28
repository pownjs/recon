exports.yargs = {
    command: 'list',
    describe: 'List option',
    aliases: ['l'],

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

        const table = []

        for (let option of options.listOptions(category)) {
            table.push(option)
        }

        console.table(table)
    }
}
