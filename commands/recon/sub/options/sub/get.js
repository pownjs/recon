exports.yargs = {
    command: 'get <name>',
    describe: 'Get option',
    aliases: ['g'],

    builder: {},

    handler: async(argv) => {
        const { options } = require('../../../lib/globals/options')

        const { name } = argv

        const value = await options.getOption(name)

        console.log(value)
    }
}
