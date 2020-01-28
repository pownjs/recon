exports.yargs = {
    command: 'clear',
    describe: 'Clear options',
    aliases: ['c'],

    builder: {},

    handler: async(argv) => {
        const { options } = require('../../../lib/globals/options')

        await options.clearOptions()
    }
}
