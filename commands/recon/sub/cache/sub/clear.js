exports.yargs = {
    command: 'clear [options]',
    describe: 'Clear cache configuration',
    aliases: ['c'],

    builder: (yargs) => {},

    handler: (argv) => {
        const { clearCache } = require('../../../lib/globals/cache')

        clearCache()
    }
}
