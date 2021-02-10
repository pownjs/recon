exports.yargs = {
    command: 'options <command>',
    describe: 'Manage options',
    aliases: ['option'],

    builder: (yargs) => {
        yargs.command(require('./sub/list').yargs)
        yargs.command(require('./sub/set').yargs)
        yargs.command(require('./sub/get').yargs)
        yargs.command(require('./sub/delete').yargs)
        yargs.command(require('./sub/clear').yargs)
    }
}
