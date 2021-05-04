exports.yargs = {
    command: 'cache <command>',
    describe: 'Manage cache',
    aliases: [],

    builder: (yargs) => {
        yargs.command(require('./sub/set').yargs)
        yargs.command(require('./sub/clear').yargs)
    }
}
